from datetime import timedelta

from django.utils import timezone as tz
from django.db.models.functions import Coalesce
from django.db.models import Q, Count, Subquery, OuterRef, QuerySet
from django.db import models

from .models import Party, Order, Location
from common.models import User


def get_user_identification(user_id) :
    return User.objects.get(user_id = user_id).identification

def get_required_minimum_price(party_id) : # 현재 파티의 가입용 최소 참가 금액 반환
    """입력한 파티의 가입용 최소 참가 금액을 계산합니다.
    Args : 
        party_id : Party 모델의 party_id 속성입니다.

    Returns : 
        string 을 반환합니다.
    """
    
    party = Party.objects.get(party_id = party_id)
    min = int(int(party.goal_price - party.current_price) / int(party.required_people_number - party.headcount))
    if min < 0 : 
        min = 0
    required_minimum_price = str(min)
    return required_minimum_price

def get_incoming_datetime(hours : int, minutes : int) :
    if hours < 0 | minutes < 0 : # 음수 시간일 경우
        raise Exception('Error : Recieved minus time factor!!!')
    
    if hours > 25 : # 하루를 넘는 시간을 받은 경우
        raise Exception('Error : Recieved a time which has over than 24h!')

    if minutes > 60 :
        if hours > 0 : # 잘못된 시간 표현
            raise Exception('Error : Recieved a wrong time expression!')
        else :
            overhour, overmin = divmod(minutes, 60)
            hours = overhour
            minutes = overmin

    now = tz.now()
    incoming = tz.now().replace(hour=hours, minute=minutes)

    if hours < now.hour : # 내일 이상일 경우
        incoming = incoming + timedelta(days=1)
    
    if hours == now.hour :
        if minutes < now.minute :
            incoming = incoming + timedelta(days=1)

    return incoming

def get_joined_party(user_id) :
    """입력한 유저가 가입한 파티 목록과 횟수를 계산합니다.

    Args : 
        user_identification : User 모델의 user_identification 속성입니다.

    Returns : 
        QuerySet을 반환하며, 구조는 다음과 같습니다 : {'party_id' : 'sum'}
        party_id : 입력한 파티가 가입한 파티의 id, sum : 해당 파티에 가입한 주문수
    """
    identification = get_user_identification(user_id = user_id)
    return Order.objects.filter(Q(user_identification = identification)).filter(is_exit = False).values('party_id').annotate(sum = Count('party_id'))

# def get_count_of_destinations() -> QuerySet : # 추후 재확인 : 자기외참조 0으로 인한 주석처리
#     """선택가능한 배달위치 별 현재 진행중인 파티 매치 수를 집계합니다.

#     Returns:
#         QuerySet을 반환하며, 구조는 Location 모델에 count 행이 추가된 것과 같습니다 : 
#         count : 대기중인 파티수
#     """
#     party_w8 = Party.objects.filter(Q(status=Party.PartyStatus.WAIT)) # 대기중인 파티들
#     party_located = party_w8.values('location_name').annotate(count = Count('location_name')) # {위치명 , 대기중인 파티수} 로 맵핑한다.

#     party_qs = party_located.filter(location_name = OuterRef('location_name')) # 외부 참조용 서브쿼리 조건문 획득. 이것은 Where party_qs.location_name = 외부테이블.location_name 과 같다.
#     location_counted = Location.objects.annotate(count = Coalesce(Subquery(party_qs.values('count')[:1], output_field=models.IntegerField(default=0)), 0))
#     #쿼리셋 = 위치.행추가(행이름 = NoneType판별(세부조건(조건문.값(파티수)[맨 앞 하나만], 출력형식 = 정수필드), None 일때 정수 0을 대입))
#     return location_counted

def get_concurrent_participate(user_id) :
    return get_joined_party(user_id=user_id).count()

def count_belong_today(user_id) :
    identification = User.objects.get(user_id = user_id).identification
    joined = Order.objects.filter(user_identification = identification).filter(attendance_time__day = tz.now().day).values('party_id').annotate(sum = Count('party_id'))
    return joined.count()

def get_joined_ongoing_party(user_id) : # 추후 재확인 : 현재 party_HowTo 에서 테스트중
    # 1. is_exit == False 여야 한다.
    # 2. 파티의 상태가 W8이어야 한다.
    identification = get_user_identification(user_id = user_id)
    return Order.objects.filter(Q(user_identification = identification)).filter(Q(is_exit = False) & Q(party_id__status = Party.PartyStatus.WAIT)).values('party_id').annotate(sum = Count('party_id'))