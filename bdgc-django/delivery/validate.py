from datetime import timedelta

from django.utils import timezone as tz
from django.db.models.functions import Coalesce
from django.db.models import Q, Count, Sum, Value, Subquery, OuterRef, QuerySet, When
from django.db import models

from .models import Party, Order, Location
from .query import get_incoming_datetime
from common.models import User


def is_joining_again(user_id, party_id) :
    identification = User.objects.get(user_id = user_id).identification
    order_list = Order.objects.filter(Q(party_id = party_id) & Q(is_exit = False)) # 추후 재확인 : 조건부 검사 필요 (0개라던지)
    
    for order in order_list :
        if order.user_identification == identification :
            return True

    return False



def is_order_gapped(user_id, hour, minute) :

    identification = User.objects.get(user_id = user_id)
    party_list = Party.objects.filter(host_identification = identification).filter(status = Party.PartyStatus.WAIT)# 이 유저가 생성한 적 있는 파티들
    incoming = get_incoming_datetime(hours=hour, minutes=minute)

    for party in party_list :
        gap : timedelta = incoming - party.order_time
        gap_minute = gap.seconds / 60
        if gap_minute < 30 or gap_minute > 1410: # 주문 시간 간격이 채 30분이 되지 않을 경우
            return False

    return True

def is_timer_over_order(hour, minute, timer) :
    estimated = get_incoming_datetime(hours=hour, minutes=minute)
    endtime = tz.now() + timedelta(minutes=timer)

    if estimated < endtime :
        return True
    else :
        return False