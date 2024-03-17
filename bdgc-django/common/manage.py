from datetime import timedelta
import datetime

from django.shortcuts import render, redirect
from django.contrib.auth.hashers import  check_password  # 비밀번호 암호화 및 일치확인
from django.http import HttpResponse,  JsonResponse
from django.urls import URLPattern
from django.db.models import Q, F, When, Case, When, Count, Subquery, OuterRef, Value
from django.utils import timezone
from django.db import models

from .models import User, WithdrawalUser, Auth , Report
from delivery.models import Party, Order, Location, Category, Observation


#로깅설정
import logging
logger = logging.getLogger('common')

# 아이피 추출
from config.get_client_ip import get_client_ip

# 이메일 전송
from .email import sendAnswerReportEmail

# json
import json

# 페이징
from django.core.paginator import Paginator  


def isAdminCheck(request):
    try:
        user_id = request.session.get('user')
        login_user = User.objects.get(user_id=user_id)

        if login_user.is_admin:
            return True
        else :
            return False
    
    except User.DoesNotExist: 
        return False

    except:
        return False

def main(request):
    if isAdminCheck(request):   
        if request.method == "GET":
            logger.info(str(get_client_ip(request)) + " : 매니저 로그인 요청")
            return render(request, 'common/manage_main.html')
        else:
            return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

    else:
        return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})

def viewReport(request):
    try :
        if isAdminCheck(request):   

            if request.method == "GET":
                page = request.GET.get('page', '1')  # 페이지
                report_list = Report.objects.all().order_by('-created_time')
                paginator = Paginator(report_list, 10)  # 페이지당 10개씩 보여주기
                page_obj = paginator.get_page(page)
                context = {'report_list' : page_obj}
                return render(request, 'common/manage_report_list.html' , context)
        
            else:
                return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})
        else:
            return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})
    except Exception as e :
        raise

        
def answerReport(request , report_id):
    if isAdminCheck(request):   
        try:

            if request.method == "GET":
                report= Report.objects.get(report_id = report_id)
                context = {'report' : report}
                return render(request, 'common/manage_report_answer.html', context)

            elif request.method == "POST":

                report= Report.objects.get(report_id = report_id)
                upload_user = User.objects.get(identification = report.upload_user_id)
                mail_title = request.POST.get('mail_title')
                mail_message = request.POST.get('mail_message')

                if not(mail_title and mail_message):
                    return render(request, 'error.html', {"error" :"모든 항목을 입력해주세요"})

                sendAnswerReportEmail(mail_title , mail_message , upload_user)
                
                report.status = "답변완료"
                report.save()

                return render(request, 'common/manage_report_answer_success.html')
      
            else:
                return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

        except (User.DoesNotExist or  User.DoesNotExist ) :
            return render(request, 'error.html', {"error" :"DB에서 데이터를 찾을 수 없습니다"})
    else:
        return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})

    
def viewUserManage(request):
    if isAdminCheck(request):   
        if request.method == "GET":
            page = request.GET.get('page', '1')  # 페이지
            user_id = request.GET.get('user_id' , '')
            user_list = User.objects.order_by('-user_id')

            if user_id:
                user_list = User.objects.filter(identification__contains = user_id)

            paginator = Paginator(user_list, 10)  # 페이지당 10개씩 보여주기
            page_obj = paginator.get_page(page)
            context = {'user_list' : page_obj ,'page': page, 'user_id': user_id}
            return render(request, 'common/manage_user.html' , context)

        else:
            return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})
    else:
        return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})


def banRequest(request):
    if isAdminCheck(request):   
        if request.method == "POST":
            try:
                data = json.loads(request.body.decode('utf-8'))
                input_user = data['input_user']
                input_checked = data['input_checked']
                get_user = User.objects.get(identification = input_user)
                get_user.is_banned = input_checked
                get_user.save()
                return JsonResponse({'message': '밴 변경 요청 처리 완료' , 'success': True})
            except User.DoesNotExist:
                return JsonResponse({'message': '존재하지 않는 유저입니다' , 'success': False})
            except:
                return JsonResponse({'message': '밴 변경 요청 처리중 서버 에러' , 'success': False})
        else:
            return JsonResponse({'message': '변경실패' , 'success': False})
    else:
        return JsonResponse({'message': '변경실패' , 'success': False})


def statistics(request):
    if isAdminCheck(request):   
        if request.method == "GET":
            return render(request, 'common/manage_statistics.html')
        else:
            return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})
    else:
        return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})


def getPartyStatisticsDoughuntChart(request):
    if isAdminCheck(request):   
        if request.method == "POST":
            try:
                today = timezone.now()
                body = json.loads(request.body.decode('utf-8'))

                if body["doughnut_month"] == "한달전" :
                    party_filtered = Party.objects.filter(
                        Q(created_time__date__gte=(today - datetime.timedelta(days=30)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
                    )
                elif body["doughnut_month"] == "일주일전" :
                    party_filtered = Party.objects.filter(
                        Q(created_time__date__gte=(today - datetime.timedelta(days=7)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
                    )
                elif body["doughnut_month"] == "어제" :
                    party_filtered = Party.objects.filter(
                        Q(created_time__date__gte=(today - datetime.timedelta(days=1)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
                    )

                party_completed = party_filtered.filter(status = Party.PartyStatus.COMPLETE)

                if body["doughnut_type"] == "타입별" :
                    party_specified = party_completed.annotate(name = F('category')).values(
                        'name').annotate(success = Count('name')).order_by('-success')
                    party_total_specified = party_filtered.annotate(name = F('category')).values(
                        'name').annotate(success = Count('name')).order_by('-success').filter(name = OuterRef('name'))

                    party_eval = party_specified.annotate(created = Subquery(party_total_specified.values('success')[:1], output_field=models.IntegerField()))
                    party_res = list(party_eval)[:6]
                elif body["doughnut_type"] == "지역별" :
                    party_specified = party_completed.annotate(name = F('location__location_name_big')).values('name').annotate(success = Count('name')).order_by('-success')
                    party_total_specified = party_filtered.annotate(name = F('location__location_name_big')).values('name').annotate(success = Count('name')).order_by('-success').filter(name = OuterRef('name'))

                    party_eval = party_specified.annotate(created = Subquery(party_total_specified.values('success')[:1], output_field=models.IntegerField()))
                    party_res = list(party_eval)[:6]
                elif body["doughnut_type"] == "가격대별" :
                    party_specified = party_completed.annotate(
                        name = Case(When(goal_price__range = (1000, 5000), then=Value("1000 ~ 5000")), 
                        When(goal_price__range = (5000, 10000), then=Value("5000 ~ 10000")), When(goal_price__range = (10000, 15000), then=Value("10000 ~ 15000")),
                        When(goal_price__range = (15000, 20000), then=Value("15000 ~ 20000")), When(goal_price__range = (20000, 25000), then=Value("20000 ~ 25000")),
                        default=Value("25000 이상"), output_field=models.CharField())
                        ).values('name').annotate(success = Count('name')).order_by('name')
                    party_total_specified = party_filtered.annotate(
                        name = Case(When(goal_price__range = (1000, 5000), then=Value("1000 ~ 5000")), 
                        When(goal_price__range = (5000, 10000), then=Value("5000 ~ 10000")), When(goal_price__range = (10000, 15000), then=Value("10000 ~ 15000")),
                        When(goal_price__range = (15000, 20000), then=Value("15000 ~ 20000")), When(goal_price__range = (20000, 25000), then=Value("20000 ~ 25000")),
                        default=Value("25000 이상"), output_field=models.CharField())
                        ).values('name').annotate(success = Count('name')).order_by('name')

                    party_res = []
                    temp = {}
                    for (item1, item2) in zip(party_specified, party_total_specified) :
                        temp = {}
                        temp['name'] = item1['name']
                        temp['success'] = item1['success']
                        temp["created"] = item2["success"]
                        party_res.append(temp)

                party_res.sort(key=lambda x : -x['success'])

                # return JsonResponse({'list' : party_res})
                return JsonResponse({'message': '완료' , 'success': True ,'statistics' : party_res })
           
            except Exception as e:
                print(e)
                return JsonResponse({'message': e, 'success': False})
        else:
            return JsonResponse({'message': '실패' , 'success': False})
    else:
        return JsonResponse({'message': '실패' , 'success': False})


def getPartyStatisticsMixedChart(request):
    if isAdminCheck(request):   
        if request.method == "POST":
            try:
                today = timezone.now()
                body = json.loads(request.body.decode('utf-8'))

                res = []
                month_ago = today.replace(day = 1, hour=23, minute=59, second=59) # 저번달 마지막 날
                cnt = 0

                if body["month"] == "이전3개월" :
                    cnt = 3
                elif body["month"] == "이전6개월" :
                    cnt = 6
                elif body["month"] == "이전12개월" :
                    cnt = 12
                
                for i in range(1, cnt + 1) :
                    start_ago = (month_ago - timedelta(days = 1)).replace(day = 1, hour=0, minute=0, second=0) # 달의 첫날
                    party_filtered = Party.objects.filter(created_time__range = (start_ago.date(), month_ago.date()))
                    
                    party_completed = party_filtered.filter(status = Party.PartyStatus.COMPLETE)

                    res.append({'success' : party_completed.count(), 'created' : party_filtered.count()})
                    month_ago = start_ago
                
                res.reverse()
                return JsonResponse({'message': '완료' , 'success': True , 'statistics' : res })
           
            except Exception as e:
                print(e)
                return JsonResponse({'message': ' 서버 에러' , 'success': False})
        else:
            return JsonResponse({'message': '실패' , 'success': False})
    else:
        return JsonResponse({'message': '실패' , 'success': False})

    
