import random
from re import M

from django.test import TestCase
from django.utils import timezone
from django.db.models import Q, F, When, Case, When, Count

from .models import *

# Create your tests here.

class StatisticTest(TestCase) :
    def setUp(self) :
        print('Pre-setting...')
        RNames = ['통계용 가게명 1', '통계용 가게명 2', '통계용 가게명 3', '통계용 가게명 4', '통계용 가게명 5', '통계용 가게명 6']
        Categoryss = [Category.Cafe, Category.FastFood, Category.Jok_Ssam, Category.Korean, Category.LunchBox, Category.Chicken]
        bulk_list = []
        locBigs = ['학교 내부', '학교 외부', '옥계']
        loc = Location.objects.all().first()
        choices = [1, 2, 3, 4, 5, 6]

        for i in range(1000) :
            res = random.choice(choices)
            location = Location(location_name_big = random.choice(locBigs), location_name_small = 'Yes', location_x = 128.39, location_y = 36.1)
            location.save()
            price = random.randrange(5000, 20001)
            bulk_list.append(Party(host_identification = "Test", created_time = timezone.now() + timezone.timedelta(days = random.randrange(1, 13)),
            order_time = timezone.now() + timezone.timedelta(days = 17), timer = 100, restaurant_name = random.choice(RNames), restaurant_link = "https://baemin.me/tScYrTZ6u",
            open_kakao_link = "https://open.kakao.com/o/gvMmwYae", goal_price = price, current_price = price, delivery_cost = 2000, required_people_number = 2,
            delivery_cost_per_person = 1000, headcount = 2, location = location, status = Party.PartyStatus.COMPLETE, category = random.choice(Categoryss), 
            share_id = str(random.randrange(999999999, 9999999999))
            ))
        
        self.fixtures = Party.objects.bulk_create(bulk_list)
        
        print(Party.objects.count())


    def test_simple(self) :
        print('Currently testing simple...')
        today = timezone.now()
        print(Party.objects.count())
        result = Party.objects.filter(Q(created_time__month=today.month) & Q(status = Party.PartyStatus.COMPLETE)).values('category').annotate( # created_cnt = Count('category'), 
            price_cnt = Count(Case(When(goal_price__range = (1000, 5000), then=5000), 
            When(goal_price__range = (5000, 10000), then=10000), When(goal_price__range = (10000, 15000), then=15000),
            When(goal_price__range = (15000, 20000), then=20000), When(goal_price__range = (20000, 25000), then=25000),
            default=30000))).order_by('price_cnt')
        print(result.count())
        print(result)

    def tearDown(self) :
        self.fixtures = None