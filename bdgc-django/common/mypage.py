from django.shortcuts import render, redirect
from django.http import HttpResponse,  JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password ,check_password # 비밀번호 암호화 및 일치확인

# 형식검사
import re

# json
import json

# 시간 관련
#from django.utils import timezone 
# # settings 내에서 SET_TZ = False 필요. 아니면 시차생김

#이메일 관련, 만약 비밀번호 변경시 이메일 인증을 사용할 경우 사용.
#from .email import sendChangePwdEmail,sendFindIdEmail


#로깅설정
import logging
logger = logging.getLogger('common')


# 아이피 추출
from config.get_client_ip import get_client_ip


def mainPage(request):  
    if request.method == "GET":
        try:
            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)
            return render(request, 'common/mypage.html')

        except User.DoesNotExist:  
            return redirect('/common/login')

        except:
            return render(request, 'error.html', {"error" :"메인페이지 에러 발생"})
       
    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def checkMyInfo(request):
    if request.method == "GET":
        try:
            logger.info(str(get_client_ip(request)) + " : 내정보 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)
            return JsonResponse({'message': "내정보 조회 성공" , 'nick_name': user.nick_name , 'manner_score' : user.manner_score , 'place' : user.place , 'alim' : user.is_alim_allowed ,'success': True})

        except User.DoesNotExist: 
            return JsonResponse({'message': "내정보 조회 실패." ,'success': False})

        except:
            return render(request, 'error.html', {"error" :"내 정보 요청 중 에러 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

def modifyNickname(request):

    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : 내정보 닉네임 변경 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)

            data = json.loads(request.body.decode('utf-8'))

            input_nick_name = data['input_nick_name']
            nick_name_validate = re.compile('^[가-힣a-z0-9]{2,12}$')

            if nick_name_validate.match(input_nick_name):
            
                user.nick_name = input_nick_name
                user.save()
                return JsonResponse({'message': '닉네임 변경완료' , 'success': True})

            else:
                return JsonResponse({'message': '올바르지 않은 형식 입니다' , 'success': False})

        except User.DoesNotExist: 
            return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

        except:
            return render(request, 'error.html', {"error" :"닉네임 변경 중 에러 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def validatePassword(request):

    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : [내정보] 현재 비밀번호 검증 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)

            data = json.loads(request.body.decode('utf-8'))

            input_password = data['input_password']

            if check_password(input_password, user.password): 
                return JsonResponse({'message': '비밀번호 검증 성공' , 'success': True})
            else:
                return JsonResponse({'message': '입력하신 현재 비밀번호가 틀립니다' , 'success': False})


        except User.DoesNotExist: 
            return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

        except:
            return render(request, 'error.html', {"error" :"비밀번호 검증 중 서버에러 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def modifyPlace(request):

    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : 내정보 장소 변경 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)

            data = json.loads(request.body.decode('utf-8'))

            input_place = data['input_place']

            if (input_place == "학교 내부" or input_place == "학교 앞 원룸" or input_place == "옥계"):
            
                user.place = input_place
                user.save()
                return JsonResponse({'message': '장소 변경완료' , 'success': True})
                   
            else:
                return JsonResponse({'message': '올바르지 않은 형식 입니다' , 'success': False})


        except User.DoesNotExist: 
            return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

        except:
            return render(request, 'error.html', {"error" :"장소 변경중 서버에서 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def modifyPassword(request):

    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : 내정보 패스워드 변경 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)

            data = json.loads(request.body.decode('utf-8'))

            input_now_password = data['input_now_password']
            input_new_password = data['input_new_password']
            input_re_password = data['input_re_password']

            # 비밀번호 검증 및 값 확인
            if not check_password(input_now_password, user.password): 
                return JsonResponse({'message': '입력하신 현재 비밀번호가 틀립니다' , 'success': False})

            if (input_now_password == input_new_password):
                return JsonResponse({'message': '변경할 비밀번호와 현재 비밀번호가 같습니다' , 'success': False})

            if not (input_new_password == input_re_password):
                return JsonResponse({'message': '입력하신 비밀번호가 서로 다릅니다' , 'success': False})
            
            # 변경할 비밀번호 형식 검사
            password_validate = re.compile('^[!?@#$%^&*():;+-=A-Za-z0-9]{5,12}$')
            if password_validate.match(input_new_password) :
                user.password = make_password(input_new_password)
                user.save()
                return JsonResponse({'message': '비밀번호 변경 완료' , 'success': True})
            else:
                return JsonResponse({'message': '비밀번호가 올바르지 않은 형식 입니다' , 'success': False})

        except User.DoesNotExist: 
            return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

        except:
            return render(request, 'error.html', {"error" :"비밀번호 변경 중 서버에서 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

def modifyAlim(request):
    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : 내정보 패스워드 변경 요청")

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)

            data = json.loads(request.body.decode('utf-8'))

            input_alim = data['input_alim']
           
            if (input_alim == True) :
                user.is_alim_allowed = True
                user.save()
                return JsonResponse({'message': '알림톡 수신 여부 변경 완료' , 'success': True})

            elif (input_alim == False) :
                user.is_alim_allowed = False
                user.save()
                return JsonResponse({'message': '알림톡 수신 여부 변경 완료' , 'success': True})

            else:
                return JsonResponse({'message': '알림톡 수신 여부 변경 실패' , 'success': False})


        except User.DoesNotExist: 
            return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

        except:
            return render(request, 'error.html', {"error" :"비밀번호 변경 중 서버에서 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})