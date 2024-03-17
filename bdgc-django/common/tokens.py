from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # install 필요. pip install six , pip install django-utils-six
                            # settings.py -> INSTALLED_APPS에 추가.

# 토큰의 유효기간은 settings.py 에서 설정.


class SignUpTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, email, timestamp):    
        return (six.text_type(email) + six.text_type(timestamp)) 
        
class ChangePasswordTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp ):    
        return (six.text_type(user.user_id) + six.text_type(timestamp) +  six.text_type(user.password))
            # 유저의 PK값, 현재 시간, 비밀번호 해시값으로 토큰 생성.

signup_token = SignUpTokenGenerator()
change_password_token = ChangePasswordTokenGenerator()