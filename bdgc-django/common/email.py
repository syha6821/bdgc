#이메일 관련
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string  # 템플릿을 렌더링하기 위한 기능.

# from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMessage
from .tokens import  change_password_token , signup_token
from django.utils.encoding import force_bytes, force_str as force_text


def sendSingUpEmail(request, email):
   
    current_site = get_current_site(request)  # request를 보낸 사이트
    domain = current_site.domain  # 현재 도메인
    uid64 = urlsafe_base64_encode(force_bytes(email)) # 이메일을 바이트로 변환후, urlsafe_base64로 인코딩.
    mail_title = "[배달가치] 회원가입 링크 입니다."  # 메일 전송시 메일 제목
    token = signup_token.make_token(email)
    message_data = signUp_message(domain, uid64, token)
    
    user_email = email + "@kumoh.ac.kr"    
    email = EmailMessage(mail_title, message_data,"baedalgachi@naver.com" ,to=[user_email])
    email.send()    # 실제 이메일 전송


def sendFindIdEmail(user):
    mail_title = "[배달가치] 아이디 찾기 메일입니다."
    message_data = find_id_message(user.identification)
   
    user_email = user.email + "@kumoh.ac.kr"   
    email = EmailMessage(mail_title, message_data,"baedalgachi@naver.com" , to=[user_email])
    email.send()    # 실제 이메일 전송

# 아이디 찾기 이메일. html형식 전송
# def sendFindIdEmail(user):
#     mail_title = "[배달가치] 아이디 찾기 메일입니다."
#     msg_html = render_to_string('common/email_find_id.html', {'user_id': user.identification})
   
#     user_email = user.email + "@kumoh.ac.kr" 

#     email = EmailMessage(mail_title, msg_html , to=[user_email])
#     email.content_subtype = 'html'
#     email.send()    


def sendChangePwdEmail(request, user):

    current_site = get_current_site(request)  # request를 보낸 사이트
    domain = current_site.domain  # 현재 도메인
    uid64 = urlsafe_base64_encode(force_bytes(user.user_id)) # 숫자인 PK를 바이트로 변환후, urlsafe_base64로 인코딩.
    mail_title = "[배달가치] 비밀번호 변경 메일입니다."
    token = change_password_token.make_token(user)
    message_data = change_password_message(domain, uid64, token)
    
    user_email = user.email + "@kumoh.ac.kr"
    email = EmailMessage(mail_title, message_data, "baedalgachi@naver.com" ,to=[user_email])
    email.send()    # 실제 이메일 전송


def sendAnswerReportEmail(mail_title , mail_message , user):
    user_email = user.email + "@kumoh.ac.kr"
    # user_email = "tteks149@naver.com"
    email = EmailMessage(mail_title, mail_message, "baedalgachi@naver.com" ,to=[user_email])
    email.send()    # 실제 이메일 전송



def auth_code_message(auth_code):  # 이메일 인증 메일
    return f"안녕하세요 배달가치 입니다. 아래의 인증코드를 입력하시고 회원가입을 진행해주시기 바랍니다. \n\n {auth_code} \n\n감사합니다."


def find_id_message(identification):  # 아이디 찾기 메일
    return f"찾으시는 아이디는 [  {identification}  ]입니다. \n\n감사합니다."


def change_password_message(domain, uid64, token):  # 비밀번호 변경 메일
    return f"아래 링크를 클릭하면 비밀번호 변경을 시작합니다.\n\n비밀번호 변경링크 : http://{domain}/common/activate_pwd/{uid64}/{token}\n\n감사합니다."


def signUp_message(domain, uid64, token):  # 비밀번호 변경 메일
    return f"아래 링크를 클릭하면 회원가입을 시작합니다.\n\n회원가입 링크 : http://{domain}/common/activate_signup/{uid64}/{token}\n\n감사합니다."
