from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, ProhibitNullCharactersValidator, URLValidator, MinLengthValidator

# Create your models here.

"""변경 이력
'22.04.05 19:51 오버로딩 감소를 파티 모델에 위해 현재인원수와 현재 도달 금액 필드 추가
"""

class Location(models.Model) :
    location_id = models.AutoField(primary_key=True)
    location_name_small = models.CharField(max_length=30, validators=[MinLengthValidator(limit_value=1,message='빈 값이 제출되었습니다!'),ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    location_name_big = models.CharField(max_length=30, validators=[MinLengthValidator(limit_value=1,message='빈 값이 제출되었습니다!'),ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    location_x = models.FloatField()
    location_y = models.FloatField()

    def __str__(self) :
        return self.location_name_small

class Category(models.TextChoices) :
    Cafe = 'CF', '카페/디저트'
    Korean = 'KR', '한식'
    Chinese = 'CN', '중식'
    Japanese = 'JP', '돈까스/회/일식'
    Chicken = 'CK', '치킨'
    RiceNoodle = 'RN', '백반/죽/국수'
    SchoolFood = 'SF', '분식'
    Stew = 'ST', '찜/탕/찌개'
    Pizza = 'PZ', '피자'
    WesternFood = 'WF', '양식'
    Meat = 'MT', '고기/구이'
    Jok_Ssam = 'JS', '족발/보쌈'
    Asian = 'AS', '아시안'
    FastFood = 'FF', '패스트푸드'
    MidnightMeal = 'MM', '야식'
    LunchBox = 'LB', '도시락'

class Party(models.Model) :

    party_id = models.AutoField(primary_key=True)

    class PartyStatus(models.TextChoices) :
            WAIT = 'W8', 'Wait'
            COMPLETE = 'CP', 'Complete'
            TIMEOUT = 'TO', 'Time Out'
            BREAKUP = 'BU', 'Break Up'

    host_identification = models.CharField(max_length=20) #foreignkey ( User.identification ) 
    created_time = models.DateTimeField()
    order_time = models.DateTimeField()
    timer = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='대기시간은 1 이하가 될 수 없습니다!')])
    restaurant_name = models.CharField(max_length=50, validators=[ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    restaurant_link = models.CharField(max_length=120, validators=[ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    open_kakao_link = models.URLField(max_length=50, validators=[ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    goal_price = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='가격은 1 이하가 될 수 없습니다!')]) # 최소주문금액 -> 목표금액 변경으로 인한 모델 변경
    current_price = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='가격은 1 이하가 될 수 없습니다!')]) # 현재 도달 금액
    delivery_cost = models.IntegerField(validators=[MinValueValidator(limit_value=0, message='배달비는 0 이하가 될 수 없습니다!')])
    delivery_cost_per_person = models.IntegerField(validators=[MinValueValidator(limit_value=0, message='배달비는 0 이하가 될 수 없습니다!')])
    required_people_number = models.IntegerField(validators=[MinValueValidator(limit_value=2, message='최대 인원은 2 이하가 될 수 없습니다!')]) 
    headcount = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='최대 인원은 1 이하가 될 수 없습니다!')]) # 현재 인원수
    location = models.ForeignKey(Location, on_delete=models.DO_NOTHING)
    status = models.CharField(max_length=2, choices=PartyStatus.choices, default=PartyStatus.WAIT)
    category = models.CharField(max_length=2, choices=Category.choices, null=True, blank=True, validators=[MinLengthValidator(limit_value=1,message='빈 값이 제출되었습니다!'), ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    share_id = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.restaurant_name + ' ' + str(self.party_id)

    def get_remain_order_time(self) -> int :
        return 0 if self.order_time < timezone.now() else (self.order_time - timezone.now()).seconds

    def get_remain_price(self) -> int :
        return 0 if self.goal_price < self.current_price else self.goal_price - self.current_price

class Report(models.Model):
    report_id = models.AutoField(help_text="report_id", primary_key=True)
    upload_user_identification = models.CharField(max_length=20) # ( User.identification ) 
    reported_user_identification = models.CharField(max_length=20) # ( User.identification ) 
    reason = models.TextField()
    create_date = models.DateTimeField()

    def __str__(self):
        return self.reported_user_identification + ' ' + self.reason
    

class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    party_id = models.ForeignKey(Party, on_delete=models.CASCADE)
    user_identification = models.CharField(max_length=20, validators=[ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')]) # ( User.identification ) 
    menu_name : models.CharField = models.CharField(max_length=30, validators=[MinLengthValidator(limit_value=1,message='빈 값이 제출되었습니다!'), ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    menu_price = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='가격은 1 이하가 될 수 없습니다!')])
    menu_amount = models.IntegerField(validators=[MinValueValidator(limit_value=1, message='갯수는 1 이하가 될 수 없습니다!')])
    personal_request = models.CharField(max_length=80, null=True, blank=True) # 참가폼에서 요청사항을 받기 위해 추가 ('22.03.29 13:23)
    attendance_time = models.DateTimeField()
    is_exit = models.BooleanField(default=False)

    def __str__(self):
        return self.user_identification + ' ' + str(self.order_id)
    

class Observation(models.Model) :
    observation_id = models.AutoField(primary_key=True)
    party_id = models.ForeignKey(Party, on_delete=models.CASCADE)
    user_identification = models.CharField(max_length=20, validators=[MinLengthValidator(limit_value=1,message='빈 값이 제출되었습니다!'), ProhibitNullCharactersValidator("Null 값이 제출되었습니다!", 'null_char_error')])
    is_button_pressed = models.BooleanField(default=False)
