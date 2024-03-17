from django.forms import ValidationError
from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password  # 비밀번호 암호화 및 일치확인
from django.http import HttpResponse ,JsonResponse
from .models import User, Auth

# 이메일 관련
from django.utils.http import urlsafe_base64_decode
from .tokens import change_password_token , signup_token
from django.utils.encoding import force_str as force_text

# 랜덤이름
from .random import randomNickNameGenerator , randomAuthCodeGenerator

# json
import json


#카카오 api
from kakaoAPI.alimAPI import sendAuthCodeKakaoAPI

# 로깅설정
import logging
logger = logging.getLogger('common')

# 아이피 추출
from config.get_client_ip import get_client_ip

# 형식 검사
import re


def sendAuthCodeKakaoApi(request, uid64, token): # 카카오 알림톡으로 인증코드 발송.

    if request.method == 'POST':
        try:
            logger.info(str(get_client_ip(request)) + " : [카카오 알림톡] 회원가입 중 인증코드 요청")
            
            uid = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 이메일을 복호화.
            auth = Auth.objects.get(email=uid)    # 복호화한 PK를 사용하여 DB에서 유저를 가져옴

            auth.auth_code = randomAuthCodeGenerator()
            auth.save()

            data = request.body
            input_phone_num = data.decode('utf-8')
            
            sendAuthCodeKakaoAPI(input_phone_num ,auth.auth_code)
           
            return JsonResponse({'message': '카카오 코드를 전송했습니다.', 'success': True})

        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})

    else:
       return HttpResponse('올바른 접근이 아닙니다.')


def checkAuthCode(request, uid64, token): # 카카오 알림톡으로 인증코드 발송.

    if request.method == 'POST':
        try:
            logger.info(str(get_client_ip(request)) + " : [카카오 알림톡] 회원가입 중 인증코드 검증 요청")

            uid = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 이메일을 복호화.
            auth = Auth.objects.get(email=uid)    # 복호화한 PK를 사용하여 DB에서 유저를 가져옴

            data = request.body
            input_auth_code = data.decode('utf-8')
            

            if auth.auth_code == input_auth_code:
                return JsonResponse({'message': '인증코드 확인 완료', 'success': True})

            else:
                return JsonResponse({'message': '인증코드가 틀립니다', 'success': False})
        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})

    else:
       return HttpResponse('올바른 접근이 아닙니다.')


def activateSignUp(request, uid64, token):
    
    if request.method == "GET":
        try:
            uid = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 이메일을 복호화.
            auth = Auth.objects.get(email=uid)    # 복호화한 PK를 사용하여 DB에서 유저를 가져옴
        
            # 토큰의 유효성 검사. True반환시.
            if signup_token.check_token(auth.email, token):

                auth.is_activate = True
                auth.save()

                randomNickName = randomNickNameGenerator()
                context = { 
                    "randomNickName" : randomNickName,
                    "email" : auth.email,
                }
                return render(request, 'common/sign_up.html', context)

            else:
               return HttpResponse('사용할 수 없는 링크 입니다')

        except ValidationError:
            return HttpResponse('검증 오류발생.')

        except KeyError:
            return HttpResponse('검증 오류발생.')

        except Auth.DoesNotExist:
            return HttpResponse('유효한 인증메일이 아닙니다')

        except:
            return JsonResponse({'message': '서버에러 발생', 'success': False})

    elif request.method == "POST":

        try:
            logger.info(str(get_client_ip(request)) + " : 회원가입 요청")
            
            input_email = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 이메일을 복호화.
            data = json.loads(request.body.decode('utf-8'))
            
            input_id = data['input_id']
            input_password = data['input_password']
            input_nick_name = data['input_nick_name']
            input_phone_num = data['input_phone_num']
            input_place = data['input_place']

            # 장소 이름 확인
            if not (input_place == "학교 내부" or input_place == "학교 앞 원룸" or input_place == "옥계"):
                return JsonResponse({'message': '장소명이 선택값과 다릅니다', 'success': False})

            # 형식 검사식
            id_validate = re.compile('^[a-z]+[a-z0-9]{3,12}$')
            nick_name_validate = re.compile('^[가-힣a-z0-9]{2,12}$')
            password_validate = re.compile('^[!?@#$%^&*():;+-=A-Za-z0-9]{5,12}$')
            
            # 형식 검사
            if  id_validate.match(input_id) \
                and nick_name_validate.match(input_nick_name) \
                and password_validate.match(input_password):
               
                # 데이터 입력전 한번더 검증. 
                if User.objects.filter(identification=input_id):
                    return JsonResponse({'message': '이미 해당 아이디의 계정이 존재합니다', 'success': False})

                # 인증 테이블 검증 확인
                auth = Auth.objects.get(email=input_email)

                if auth.is_activate == True:

                    user = User (
                    identification = input_id,
                    password = make_password(input_password),
                    nick_name = input_nick_name,
                    phone_number = input_phone_num,
                    email = input_email,
                    place = input_place,
                    manner_score= 0,
                    is_admin = False,
                    is_banned = False,
                    )
                    user.save()
                    auth.delete()
                    return JsonResponse({'message': '회원가입 성공' , 'success': True})

                else:
                    return JsonResponse({'message': '이메일 인증을 완료해주세요', 'success': False})

            else:
                return JsonResponse({'message': '형식에 맞게 값을 입력해주세요', 'success': False})

        except Auth.DoesNotExist:
            return JsonResponse({'message': '이메일 전송을 확인해 주세요', 'success': False})

        # except:
        #     return JsonResponse({'message': '서버에러 발생', 'success': False})

    else:
        return HttpResponse('유효하지 않은 접근 입니다.') 

    
def activatePassword(request, uid64, token):    # 사용자가 이메일 인증 URL 클릭시 비밀번호 변경

    if request.method == "GET":
    
        try:
            response_data = {}
            uid = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 PK를 복호화.
            user = User.objects.get(user_id=uid)    # 복호화한 PK를 사용하여 DB에서 유저를 가져옴

            # 토큰의 유효성 검사. True반환시.
            if change_password_token.check_token(user, token):

                # 비밀번호 변경 페이지 전환.
                return render(request, 'common/activate_password.html')

            else:
                return HttpResponse('사용할 수 없는 링크 입니다')


        except ValidationError:
            return HttpResponse('검증 오류발생.')

        except KeyError:
            return HttpResponse('검증 오류발생.')

        except User.DoesNotExist:
            return HttpResponse('해당 유저는 존재하지 않습니다.')

        except:
            return HttpResponse('서버 에러 발생.')

    elif request.method == "POST":

        try:
            data = json.loads(request.body.decode('utf-8'))

            input_password = data['input_password']
            input_re_password = data['input_re_password']

            # 형식 검사식
            password_validate = re.compile('^[!?@#$%^&*():;+-=A-Za-z0-9]{5,12}$')

            if not (input_password == input_re_password):
                return JsonResponse({'message': '입력하신 비밀번호가 서로 다릅니다' , 'success': False})

            if not password_validate.match(input_password):
                return JsonResponse({'message': '올바르지 않은 비밀번호 형식 입니다' , 'success': False})

            uid = force_text(urlsafe_base64_decode(uid64))  # 인코딩된 PK를 복호화.
            user = User.objects.get(user_id=uid)    # 복호화한 PK를 사용하여 DB에서 유저를 가져옴

            # 토큰의 유효성 검사. True반환시.
            if change_password_token.check_token(user, token):

                user.password = make_password(input_password)
                user.save()

                return JsonResponse({'message': '비밀번호 변경 성공' , 'success': True})

            else:
                return HttpResponse('사용할 수 없는 링크 입니다')

                

        except ValidationError:
            return HttpResponse('검증 오류발생.')

        except KeyError:
            return HttpResponse('검증 오류발생.')

    else:
        return HttpResponse('유효하지 않은 접근 입니다.') # GET or POST방식 아님