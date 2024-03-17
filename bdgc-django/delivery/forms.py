from django import forms
from django.core.validators import URLValidator, MinValueValidator

from delivery.models import *

class PartyForm(forms.Form) :
    restaurant_link = forms.CharField(max_length=200)
    open_kakao_link = forms.CharField(max_length=200)
    restaurant_name = forms.CharField(max_length=50)
    menu = forms.CharField(max_length=50)
    price = forms.IntegerField()
    amount = forms.IntegerField()
    goal_price = forms.IntegerField()
    required_people_number = forms.IntegerField() # 추후 재확인 : 다시한번 생각
    delivery_cost = forms.IntegerField()
    delivery_destination = forms.CharField(max_length=30) # 추후 재확인 : 이걸 이넘으로 쓰던지 어쩌던지 수정이 필요
    order_time_hour = forms.IntegerField()
    order_time_minute = forms.IntegerField()
    timer = forms.IntegerField()


class JoinForm(forms.ModelForm) :
    menu_price = forms.IntegerField(validators=[MinValueValidator(limit_value=0, message='가격은 0 이하가 될 수 없습니다!')])
    menu_amount = forms.IntegerField(validators=[MinValueValidator(limit_value=1, message='갯수는 1 이하가 될 수 없습니다!')])
    class Meta :
        model = Order
        fields = ['menu_name', 'personal_request']