from django.db import models

# Create your models here.

class User(models.Model) :
    user_id = models.AutoField(primary_key=True)
    identification = models.CharField(max_length=20)
    password = models.CharField(max_length=128) # 해시값 길이 
    nick_name = models.CharField(max_length=30) # 6~7글자
    phone_number = models.CharField(max_length=12) # - 빼고 
    email = models.EmailField(max_length=50)
    manner_score = models.DecimalField(max_digits=2, decimal_places=0)
    place = models.CharField(max_length=128) # 현재 사는 위치 정보 
    is_admin = models.BooleanField(default=False) # 관리자 여부
    is_banned = models.BooleanField(default=False) # 밴 여부 
    is_alim_allowed = models.BooleanField(default=True) # 해당지역 파티 생성시, 알림톡 수신 여부

# 회원탈퇴한 유저 정보를 임시로 저장할 테이블. 일주일이 지난 데이터는 자동삭제되도록.
class WithdrawalUser(models.Model) :
    user_id = models.AutoField(primary_key=True)
    identification = models.CharField(max_length=20)   
    nick_name = models.CharField(max_length=30) # 6~7글자
    phone_number = models.CharField(max_length=12) 
    email = models.EmailField(max_length=50)
    create_date = models.DateTimeField()
    
class Auth(models.Model) :
    auth_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50)
    auth_code = models.CharField(max_length=4)
    is_activate = models.BooleanField(default=False)

class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    upload_user_id = models.CharField(max_length=20)
    type = models.CharField(max_length=30)
    title = models.CharField(max_length=500)
    reason = models.TextField()
    file_path = models.FileField(upload_to="report_file/%Y/%m/%d", null=True)
    created_time = models.DateTimeField()
    status = models.CharField(max_length=20) # 추가
