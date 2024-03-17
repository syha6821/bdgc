from functools import wraps
import logging

from django.shortcuts import render, get_object_or_404, redirect, resolve_url
from django.http import HttpRequest, JsonResponse
from django.urls import reverse
from django.db import transaction as ts


def get_logger() :
    return logging.getLogger('delivery')

def print_log(message : str) :
    logging.getLogger('delivery').info(msg=message)

def view_logger_func(func) :
    @wraps(func)
    def wrapper(request, *args, **kwargs) :
        logger = logging.getLogger('delivery')
        try:
            user_id = 'anonymous' if 'user' not in request.session else request.session['user']
            logger.info(msg=f'{func.__name__} is called by {user_id} with args : {args}, kwargs : {kwargs}')
                
            result = func(request, *args, **kwargs)
            return result
        except Exception as e:
            logger.warning(f'{func.__name__} has gone wrong due to exception!')
            logger.exception(e, *args)
            if request.method == 'POST' :
                return JsonResponse({'success' : False, 'message' : '알 수 없는 이유로 작업에 실패하였습니다.'})
            else :
                return render(request, 'error.html', {"error" :"알 수 없는 이유로 작업에 실패하였습니다"})
    return wrapper

def view_logger_method(func) :
    @wraps(func)
    def wrapper(self, request, *args, **kwargs) :
        logger = logging.getLogger('delivery')
        try:
            user_id = 'anonymous' if 'user' not in request.session else request.session['user']
            logger.info(msg=f'{self.__class__.__name__}\'s {request.method} is called by {user_id} with args : {args}, kwargs : {kwargs}')
                
            result = func(self, request, *args, **kwargs)
            return result
        except Exception as e:
            logger.warning(f'{self.__class__.__name__} has gone wrong due to exception!')
            logger.exception(e, *args)
            if request.method == 'POST' :
                return JsonResponse({'success' : False, 'message' : '알 수 없는 이유로 작업에 실패하였습니다.'})
            else :
                return render(request, 'error.html', {"error" :"알 수 없는 이유로 작업에 실패하였습니다"})
    return wrapper

def procedure_logger(func) :
    @wraps(func)
    def wrapper(*args, **kwargs) :
        logger = logging.getLogger('delivery')
        try:
            logger.info(msg=f'{func.__name__} is called with args : {args}, kwargs : {kwargs}')
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            logger.warning(f'{func.__name__} has gone wrong due to exception!')
            logger.warning(e, *args)
            return None
    return wrapper

def logger_exception(func) :
    @wraps(func)
    def wrapper(*args, **kwargs) :
        logger = logging.getLogger('delivery')
        try :
            return func(*args, **kwargs)
        except Exception as e :
            logger.warning(f'{func.__name__} has gone wrong due to exception!')
            logger.warning(e, *args)
            return None
    return wrapper

def is_authenticated(func) : 
    @wraps(func)
    def wrapper(request : HttpRequest, *args, **kwargs) :
        if 'user' in request.session :
            return func(request, *args, **kwargs)
        else :
            whole_url = request.build_absolute_uri().replace('http://', '').strip()
            target_url_list = whole_url.split('/') # 전체 URL에서 http://------.com 에 해당하는 부분이 빠지고 남은 내용들
            target_url_list = target_url_list[1:len(target_url_list)-1]
            target_url = '_'.join(target_url_list)
            login_url = resolve_url('common:login')
            return redirect(f'{login_url}?return={target_url}')
    return wrapper

def concurrency(func) :
    @wraps(func)
    def wrapper(request, share_id, *args, **kwargs) :
        from .manager import MatchManager
        try :
            MatchManager.acquire(share_id)
            result = func(request, share_id, *args, **kwargs)
            MatchManager.release(share_id)
        except Exception as e:
            logger = logging.getLogger('delivery')
            logger.warning(f'{func.__name__} has gone wrong due to exception!')
            logger.exception(msg=e, args=args)
            raise 
        return result
    return wrapper
 
def transaction(func) :
    @wraps(func)
    @ts.atomic(using='default')
    def wrapper(*args, **kwrags) :
        try :
            with ts.atomic() :
                return func(*args, **kwrags)
        except :
            raise
    return wrapper