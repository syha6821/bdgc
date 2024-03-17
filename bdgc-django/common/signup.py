from .models import User, Auth
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password

#이메일
from .email import  sendSingUpEmail

#json
import json

#랜덤생성
from .random import randomAuthCodeGenerator, randomNickNameGenerator

#로깅설정
import logging
logger = logging.getLogger('common')

# 아이피 추출
from config.get_client_ip import get_client_ip


def idDuplicateCheck(request):  # 아이디 중복 검사

    if request.method == 'POST':
        try:
            data = request.body
            user_id = data.decode('utf-8')
            
            logger.info(str(get_client_ip(request)) + " : 아이디 중복 검사 요청")

            if user_id:
                
                if User.objects.filter(identification=user_id):
                    return JsonResponse({'message': '이미 존재하는 아이디 입니다', 'success': False})

                else:
                    return JsonResponse({'message': '생성 가능한 아이디 입니다', 'success': True})

            else:
                return JsonResponse({'message': '아이디를 입력해주세요', 'success': False})
        
        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})

    else:
       return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def emailDuplicateCheck(request):  # 이메일 중복 검사

    if request.method == 'POST':
        try:

            # ip 로깅.
            logger.info(str(get_client_ip(request)) + " : 이메일 중복 검사 요청")

            data = request.body
            input_email = data.decode('utf-8')
           
            if input_email:

                if User.objects.filter(email=input_email):
                    return JsonResponse({'message': '이미 존재하는 이메일 입니다', 'success': False})

                else:
                    return JsonResponse({'message': '사용가능한 이메일 입니다' , 'success': True})

            else:
                return JsonResponse({'message': '이메일을 입력해주세요', 'success': False})
    
        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})
    else:
       return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

def signUpEmailSubmit(request):  # 회원가입 이메일 전송

    if request.method == 'POST':
        try:

            logger.info(str(get_client_ip(request)) + " : 회원가입 이메일 전송 요청")

            input_email = request.body.decode('utf-8')
            if input_email:
                
                # 이메일로 이미 가입됐는지 체크.
                if User.objects.filter(email=input_email):
                    return JsonResponse({'message': '이미 가입된 이메일 입니다', 'success': False})

                # 가입되지 않은 이메일이 한번더 인증코드 보낼경우
                # 기존 삭제후, 새로 다시 전송
                temp = Auth.objects.filter(email=input_email)

                if temp:
                    temp.delete()

                Auth(
                    email=input_email,
                    is_activate = False,
                    auth_code = randomAuthCodeGenerator()
                ).save()

                sendSingUpEmail(request ,input_email)

                return JsonResponse({'message': '인증번호를 메일로 전송했습니다' , 'success': True})
            
            else:
                return JsonResponse({'message': '이메일 입력이 없습니다', 'success': False})

        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})

    else:
       return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def signup(request):   # 회원가입 진행. 처음에 이메일 인증페이지부터. 나머진 fetch

    if request.method == "GET":
        try:
            return render(request, 'common/verify_email.html')
        except:
            return render(request, 'error.html', {"error" :"이메일 인증페이지 에러 발생"})
    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})