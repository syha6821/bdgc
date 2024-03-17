from django.shortcuts import render, redirect
from django.contrib.auth.hashers import  check_password  # 비밀번호 암호화 및 일치확인
from django.http import HttpResponse,  JsonResponse
from .models import User, WithdrawalUser, Auth

from delivery.models import Order

# 시간 관련
from django.utils import timezone # settings 내에서 SET_TZ = False 필요. 아니면 시차생김

#이메일 관련
from .email import sendChangePwdEmail,sendFindIdEmail


#로깅설정
import logging
logger = logging.getLogger('common')

# 아이피 추출
from config.get_client_ip import get_client_ip

#json
import json

from kakaoAPI.alimAPI import sendAuthCodeKakaoAPI , sendHostMatchFinMsgKakaoAPI ,sendMatchFinMsgKakaoAPI , sendMatchFailMsgKakaoAPI

def login(request):
    response_data = {}

    if request.method == "GET":    # 로그인 창 요청
        try:
            return render(request, 'common/login.html')
        except:
            return render(request, 'error.html', {"error" :"로그인 페이지 에러발생"})
            
    elif request.method == "POST":  # 로그인창에서 값 입력후, 로그인 버튼 입력

        try:

            logger.info(str(get_client_ip(request)) + " : 로그인 요청")

            login_id = request.POST.get('input_id', None)
            login_password = request.POST.get('input_password', None)

            if (login_id and login_password):  # 아이디와 비번 입력 검증

                # Post로 받아온 아이디로 , db의 객체를 가져옴
                user = User.objects.get(identification=login_id)

                if not check_password(login_password, user.password):  # 비밀번호 검증
                    response_data['error'] = "비밀번호를 다시 확인해주세요"
                    return render(request, 'common/login.html', response_data)

                else:

                    if user.is_banned:
                        response_data['error'] = "밴 당한 계정입니다. 관리자에게 문의해주세요"
                        return render(request, 'common/login.html', response_data)

                    elif user.is_admin:
                        request.session['user'] = user.user_id
                        return redirect('../manage')

                    else:   # 이메일 인증 완료 검사.
                        # 세션 user라는 키에 유저 PK로 추가. ( 로그인 유지 , PK값은 DB접근시 나중에 사용하기 위함.)
                        request.session['user'] = user.user_id

                        url = get_url_after_login(request)
                        return redirect(url)

            else:
                response_data['error'] = "아이디와 비밀번호를 모두 입력해주세요"
                return render(request, 'common/login.html', response_data)


        except User.DoesNotExist:   # 로그인 시 입력한 아이디가 DB에 없음
            response_data['error'] = "존재하지 않는 아이디 입니다"
            return render(request, 'common/login.html', response_data)
        
        except:
            return render(request, 'error.html', {"error" :"로그인 도중 서버에러 발생"})

    else:
       return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def get_url_after_login(request) :
    url = request.build_absolute_uri()
    if url.find("?") == -1 :
        return str('/')

    params : str = url.split('?')[1]
    target_url = params

    if params.find("&") != -1 :
        target_url = params.split('&')[0]

    target_url : str = target_url.split('=')[1]
    url_list = target_url.split('_')
    whole_url = str('/') + '/'.join(url_list)

    return whole_url

    
def logout(request):  # 만약 세션에 user 가 없는데 로그아웃 시도하면 KeyError 뜸.

    if request.method == "GET":

        try:
            if request.session.get('user'):
                logger.info(str(get_client_ip(request)) + " : 로그아웃 요청")
                request.session.flush()

            return redirect('/')
        except:
            return render(request, 'error.html', {"error" :"로그아웃 중 서버에서 발생"})
            
    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def manage(request):

    if request.method == "GET":

        try:
            logger.info(str(get_client_ip(request)) + " : 매니저 로그인 요청")
            user_id = request.session.get('user')
            login_user = User.objects.get(user_id=user_id)

            if login_user.is_admin:    # 관리자인지 체크
                return render(request, 'common/manage_main.html')
            else:
                return render(request, 'error.html', {"error" :"관리자 계정이 아닙니다"})

        except User.DoesNotExist:   # 로그인 시 입력한 아이디가 DB에 없음
            return render(request, 'error.html', {"error" :"해당 관리자 계정이 없습니다"})

        except:
            return render(request, 'error.html', {"error" :"관리자 로그인 도중 서버에러 발생"})
            

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def findId(request):
    if request.method == "GET":
       
        try:
            return render(request, 'common/find_id.html')

        except:
            return render(request, 'error.html', {"error" :"아이디 찾기 페이지 에러 발생"})
       

    elif request.method == "POST":

        try:
            logger.info(str(get_client_ip(request)) + " : 아이디 찾기 요청")

            data = json.loads(request.body.decode('utf-8')) 
            
            input_email = data['input_email']

            user = User.objects.get(email=input_email)
            sendFindIdEmail(user)
            return JsonResponse({'message': '아이디 찾기 메일 전송 완료', 'success': True})

        except User.DoesNotExist:   # 입력한 이메일이 없음.
            return JsonResponse({'message': '해당 이메일로 가입된 계정이 없습니다', 'success': False})

        except :
            return JsonResponse({'message': '아이디 찾기 메일전송 중 에러발생', 'success': False})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def changePassword(request):


    if request.method == "GET":
        try:
            return render(request, 'common/change_password.html')
        except:
            return render(request, 'error.html', {"error" :"비밀번호 페이지 에러 발생"})

    elif request.method == "POST":
        try:
            
            logger.info(str(get_client_ip(request)) + " : 비밀번호 변경 요청")

            data = json.loads(request.body.decode('utf-8'))
            input_id = data['input_id']
            input_email = data['input_email']

            user = User.objects.get(
                identification=input_id,
                email=input_email
            )
            sendChangePwdEmail(request, user)
            
            return JsonResponse({'message': '비밀번호 변경메일 전송 완료', 'success': True})

        except User.DoesNotExist:   # 입력한 이메일이 없음.
            return JsonResponse({'message': '입력하신 계정이 존재하지 않습니다', 'success': False})

        except :
            return JsonResponse({'message': '아이디 찾기 메일전송 중 에러발생', 'success': False})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})


def withdrawal(request):
  
    if request.method == "POST":
        try:
            logger.info(str(get_client_ip(request)) + " : 회원탈퇴 요청")

            user_id = request.session.get('user')
            login_user = User.objects.get(user_id=user_id)

            # 진행중인 파티를 받아와서 하나라도 있으면, 막아야함
            
            party_list = Order.objects.filter(user_identification = login_user.identification)

            for party in party_list:
                if (party.is_exit == 0):
                    return JsonResponse({'message': '이미 가입된 파티가 존재합니다. \n파티가 종료된 후 다시 시도해 주세요', 'success': False})

            
            withdrawaluser = WithdrawalUser(
                identification=login_user.identification,
                nick_name = login_user.nick_name,
                phone_number=login_user.phone_number,
                email=login_user.email,
                create_date= timezone.now().strftime("%Y-%m-%d %H:%M:%S")
            )
            withdrawaluser.save()

            request.session.pop('user')
            login_user.delete()

            # 회원탈퇴시,악성유저를 고려하여 나중에 삭제되도록.
            return JsonResponse({'message': '회원탈퇴 완료', 'success': True})

        except User.DoesNotExist:   # 로그인 시 입력한 아이디가 DB에 없음
            return JsonResponse({'message': '로그인 상태가 아닙니다', 'success': False})

        except:
            return JsonResponse({'message': '회원탈퇴 중 서버에러 발생', 'success': False})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

