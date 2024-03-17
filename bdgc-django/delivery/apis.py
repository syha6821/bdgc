from datetime import timedelta
import json
import base64
import hashlib
from os import urandom

from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db.models import Q, F, When, Case, When
from django.core.paginator import Paginator
from django.utils.encoding import force_str as force_text
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import render

from delivery.decorator import logger_exception, transaction

from .validate import is_order_gapped, is_timer_over_order
from .query import *
from .models import *
from .manager import *

#region Some Checks
@logger_exception
def order_gap_check(request) :
    if request.method == 'POST' :

        data = request.body
        minute_only_time = data.decode('utf-8')
        hour, minute = divmod(int(minute_only_time), 60)

        if is_order_gapped(request.session['user'], hour, minute) :
            return JsonResponse({'Result' : 'True'}, status=200)

        else :
            return JsonResponse({'Result' : 'False'}, status=220)

@logger_exception
def check_timer_over_order(request) :
    if request.method == 'POST' :
        from django.utils import timezone as tz
        body = json.loads(request.body.decode('utf-8'))
        if body["order_hour"] == "" or body["order_minute"] == "" or body["timer"] == "" :
            return JsonResponse({'Result' : 'True'}, status=200)

        if is_timer_over_order(hour=int(body["order_hour"]), minute=int(body["order_minute"]), timer=int(body["timer"])) :
            return JsonResponse({'Result' : 'False'}, status=220)
        else :
            return JsonResponse({'Result' : 'True'}, status=200)

@logger_exception
def check_total_prices_over_min(request, share_id) : # 추후 재확인 : 현재 프론트엔드에서 이거 다른 방식으로라도 검사하고 있는지?
    try : 
        party_id = Party.objects.get(share_id = share_id).party_id
    except :
        return JsonResponse({'Result' : 'False'}, status=220)
        
    if request.method == 'POST' :
        body = json.loads(request.body.decode('utf-8'))
        if body["price_1"] == "" or body["amount_1"] == "":
            return JsonResponse({'Result' : 'True'}, status=200)
        
        price = int(body["price_1"])
        amount = int(body["amount_1"])

        if price * amount < int(get_required_minimum_price(party_id=party_id)) :
            return JsonResponse({'Result' : 'False'}, status=220)
        
        else:
            return JsonResponse({'Result' : 'True'}, status=200)
#endregion

@logger_exception
def get_restaurant_name_coupang_eats(request) : 
    import requests # 추후 재확인 : pip install requests 로 해당 패키지를 설치해야 합니다.
    from bs4 import BeautifulSoup

    if request.method == 'POST' :
        data = request.body
        url = data.decode('utf-8')
        hearders = {'headers':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:51.0) Gecko/20100101 Firefox/51.0'}
        n = requests.get(url=url, headers=hearders)
        al = n.text
        soup = BeautifulSoup(al,'html.parser')
        storeId =  soup.select_one('#linkParameter').get('data-storeid')
        coupang_app_link = "coupangeats://StoreDetail?storeId={storeId}&amp".format(storeId=storeId)
        title = al[al.find('<title>') + 7 : al.find('</title>')]
        title = title[title.find('[') + 1 : title.find(']')]
        data = {'Result' : 'True', 'store_name' : title, 'coupang_app_link' : coupang_app_link}
        return JsonResponse(data, status=200)

#region index pages
@logger_exception
def get_party_list_json(request) :
    """ 메인화면에서 스켈레톤에 띄울 파티들을 불러오는 함수.
    """
    while True :
        if 'loading' not in request.session :
            break

    if 'loading' not in request.session :
        request.session['loading'] = True

    location_default = ''
    if 'user' in request.session :
        pass
        #location_default = User.objects.get(user_id = request.session['user']).place # 합치면서 추후 재확인

    location = request.GET.get('location', '') # 지역 구분
    keyword = request.GET.get('search_keyword', '')  # 검색어
    last_share_id = request.GET.get('last_share_id', '')  # 마지막에 표시된 파티의 share_id (Paginating 용도)
    is_search_btn_pressed = request.GET.get('is_search', 'False')
    count_per_once = 7

    if 'search_mode' not in request.session :
        request.session['search_mode'] = 0
    net_search_mode = 0
    
    if 'location_before' not in request.session :
        request.session['location_before'] = location
    if 'keyword_before' not in request.session :
        request.session['keyword_before'] = keyword
    #region validation
    #endregion

    #region Search, Sorting, Paging
    # 정렬부
    party_list = Party.objects.filter(status = Party.PartyStatus.WAIT).annotate(remain_price = F('goal_price') - F('current_price')).order_by('remain_price') # 파티 조회 시, 얼마 안 남은 금액부터 출력
    if 'user' in request.session :
        username = get_user_identification(user_id = request.session['user'])
        joined_orders = Order.objects.filter(Q(is_exit = False) & Q(user_identification = username)).values('party_id')
        party_list = party_list.exclude(party_id__in = joined_orders)
    order_list = Order.objects.filter(Q(menu_name__icontains = keyword) & Q(party_id__status=Party.PartyStatus.WAIT))
    # 검색부
    if keyword: # 매장명 검색
        net_search_mode += 2
        party_list = party_list.filter(
            Q(restaurant_name__icontains=keyword) | Q(party_id__in = Subquery(order_list.values('party_id')))  # 매장명 혹은 메뉴 검색
        ).distinct() # distinct 써도 되는 거 맞나?
    
    if location: # 지역 검색
        net_search_mode += 1
        party_list = party_list.filter(
            Q(location__location_name_big__icontains=location)
        ).distinct()
    else : # 사용자의 기본 지정 위치 반영
        if location_default:
            net_search_mode += 1
            party_list = party_list.filter(
                Q(location__location_name_big__icontains=location_default)
            ).distinct() 

    if net_search_mode != request.session['search_mode'] :
        request.session['last_obj'] = 0
        request.session['search_before'] = []
        request.session['location_before'] = location
        request.session['keyword_before'] = keyword
    else :
        if request.session['location_before'] != location :
            request.session['last_obj'] = 0
            request.session['search_before'] = []
            request.session['location_before'] = location
            request.session['keyword_before'] = keyword
        elif request.session['keyword_before'] != keyword :
            request.session['last_obj'] = 0
            request.session['search_before'] = []
            request.session['location_before'] = location
            request.session['keyword_before'] = keyword
        elif is_search_btn_pressed == "True" :
            request.session['last_obj'] = 0
            request.session['search_before'] = []
            request.session['location_before'] = location
            request.session['keyword_before'] = keyword


    if 'search_before' not in request.session :
        request.session['search_before'] = []
    else :
        party_list = party_list.exclude(Q(party_id__in = request.session['search_before']))
    
    if 'last_obj' in request.session :
        party_list = party_list.exclude(Q(remain_price__lt = request.session['last_obj']))
    
    if party_list.count() == 0 :
        if 'loading' in request.session :
            request.session.pop('loading')
        return JsonResponse({'success' : False, 'party_list' : {}})

    party_set = party_list.all()[:count_per_once]

    # request.session['last_obj'] = party_set[party_set.count()-1:party_set.count()].first().remain_price
    # request.session['search_before'].extend(list(party_set.values_list('party_id', flat=True)))
    # request.session['search_mode'] = net_search_mode

    party_json = []

    if party_set.count() == 0 :
        if 'loading' in request.session :
            request.session.pop('loading')
        return JsonResponse({'success' : False, 'party_list' : {}})

    party : Party
    for party in party_set :
        if party.remain_price < 0 :
            party.remain_price = 0
        left_time = int(((party.created_time + timedelta(minutes=party.timer)) - timezone.now()).seconds / 60)
        party_json.append({'party_pk' : party.party_id, 'order_time' : party.order_time.strftime('%H시%M분'), 'restaurant_name' : party.restaurant_name, 'restaurant_link' : party.restaurant_link,
        'open_kakao_link' : party.open_kakao_link, 'participation_fee' : int(party.remain_price / (party.required_people_number - party.headcount)), 'delivery_cost' : party.delivery_cost,
        'location_big' : party.location.location_name_big, 'location_small' : party.location.location_name_small, 'location_x' : party.location.location_x, 'location_y' : party.location.location_y,
        'required_people_number' : party.required_people_number, 'left_time' : left_time, 'headcount' : party.headcount, 'category' : party.category, 'share_url' : party.share_id})

    total_json = {'success' : True, 'party_list' : party_json}

    if 'loading' in request.session :
        request.session.pop('loading')

    return JsonResponse(total_json)
    #endregion

@logger_exception
def get_location_list(request) :
    """ 메인 화면에서 지도 호출 시 핀으로 표기할 파티들을 반환함.
    """
    if request.method == 'GET' :
        location = request.GET.get('location', '')
        party_list = Party.objects.filter(Q(status = Party.PartyStatus.WAIT) & Q(location__location_name_big__icontains=location))
        values_list = party_list.values_list('location__location_x', 'location__location_y', 'party_id', 'category')
        return JsonResponse({'coordinates_array' : list(values_list)})

@logger_exception
def get_party_by_location(request) :
    """ 지도에서 특정 핀을 선택했을 경우 해당하는 파티의 정보를 반환함.
    """
    party_id = None

    if request.method == 'GET' :
        party_id = request.GET.get('party_pk', '')
    else : # POST
        body = json.loads(request.body.decode('utf-8'))
        party_id = int(body['party_pk'])

    party : Party = Party.objects.get(party_id = party_id)

    left_time = int(((party.created_time + timedelta(minutes=party.timer)) - timezone.now()).seconds / 60)
    remain_price = party.goal_price - party.current_price
    total_json = {
        'party_pk' : party.party_id, 'order_time' : party.order_time.strftime('%H시%M분'), 'restaurant_name' : party.restaurant_name, 'restaurant_link' : party.restaurant_link,
        'open_kakao_link' : party.open_kakao_link, 'participation_fee' : int(remain_price / (party.required_people_number - party.headcount)), 'delivery_cost' : party.delivery_cost,
        'location_big' : party.location.location_name_big, 'location_small' : party.location.location_name_small, 'location_x' : party.location.location_x, 'location_y' : party.location.location_y,
        'required_people_number' : party.required_people_number, 'left_time' : left_time, 'headcount' : party.headcount, 'category' : party.category, 'share_url' : party.share_id
    }

    return JsonResponse(total_json)

@logger_exception
def get_joined_party_json(request) :
    if 'user' in request.session :
        party_json = {}
        joined_party = get_joined_party(request.session['user'])
        if joined_party.count() > 0 :
            username = get_user_identification(request.session['user'])
            party_list = Party.objects.filter(party_id__in=joined_party.values('party_id')).annotate(share_url = F('share_id'),
            is_host = Case(When(host_identification = username, then = True), default = False, output_field=models.BooleanField()))
            party_info = party_list.values('restaurant_name', 'headcount', 'required_people_number', 'share_url', 'is_host')
            
            return JsonResponse({'success' : True, 'list' : list(party_info)})
        else :
            return JsonResponse({'success' : False, 'list' : None})
    else :
        return JsonResponse({'success' : False, 'list' : None})

#endregion

@transaction
@logger_exception
def observation_btn_procedure(request) :
    # 파티원 음식 수령 링크
    # 파티장 집합알림 전송 링크
    try :
        is_host = request.GET.get('is_host', '')
        hashed_Observation = request.GET.get('hashed_Observation', '')
        hashed_username = request.GET.get('hashed_username', '')
        
        obs_pk = force_text(urlsafe_base64_decode(hashed_Observation))
        username = force_text(urlsafe_base64_decode(hashed_username))

        observe : Observation = Observation.objects.filter(Q(user_identification = username) & Q(observation_id = obs_pk)).first()
        
        if observe.is_button_pressed == False :
            if is_host == "host" :
                MatchManager.assemble_btn_pressed(observe.party_id, username)
                observe.is_button_pressed = True
                observe.save()
            elif is_host == "not_host" :
                MatchManager.recieve_btn_pressed(observe.party_id, User.objects.get(identification = username).user_id)
                observe.is_button_pressed = True
                observe.save()

        return render(request, 'kakao_alim.html')
    except Exception as e :
        return render(request, 'error.html', {"error" :f"알림 전송에 실패하였습니다 : {e}"})


@logger_exception
def get_statistics_doughnut(request) : 
    today = timezone.now()
    body = json.loads(request.body.decode('utf-8'))

    if body["doughnut_month"] == "한 달 전" :
        party_filtered = Party.objects.filter(
            Q(created_time__date__gte=(today - datetime.timedelta(days=30)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
        )
    elif body["doughnut_month"] == "일주일 전" :
        party_filtered = Party.objects.filter(
            Q(created_time__date__gte=(today - datetime.timedelta(days=7)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
        )
    elif body["doughnut_month"] == "어제" :
        party_filtered = Party.objects.filter(
            Q(created_time__date__gte=(today - datetime.timedelta(days=1)).date())& Q(created_time__date__lte = datetime.date(today.year, today.month, today.day))
        )

    party_completed = party_filtered.filter(status = Party.PartyStatus.COMPLETE)

    if body["doughnut_type"] == "타입별" :
        party_specified = party_completed.annotate(name = F('category')).values(
            'name').annotate(success = Count('name')).order_by('-success')
        party_total_specified = party_filtered.annotate(name = F('category')).values(
            'name').annotate(success = Count('name')).order_by('-success').filter(name = OuterRef('name'))

        party_eval = party_specified.annotate(created = Subquery(party_total_specified.values('success')[:1], output_field=models.IntegerField()))
        party_res = list(party_eval)[:6]
    elif body["doughnut_type"] == "지역별" :
        party_specified = party_completed.annotate(name = F('location__location_name_big')).values('name').annotate(success = Count('name')).order_by('-success')
        party_total_specified = party_filtered.annotate(name = F('location__location_name_big')).values('name').annotate(success = Count('name')).order_by('-success').filter(name = OuterRef('name'))

        party_eval = party_specified.annotate(created = Subquery(party_total_specified.values('success')[:1], output_field=models.IntegerField()))
        party_res = list(party_eval)[:6]
    elif body["doughnut_type"] == "가격대별" :
        party_specified = party_completed.annotate(
            name = Case(When(goal_price__range = (1000, 5000), then=Value(5000)), 
            When(goal_price__range = (5000, 10000), then=Value(10000)), When(goal_price__range = (10000, 15000), then=Value(15000)),
            When(goal_price__range = (15000, 20000), then=Value(20000)), When(goal_price__range = (20000, 25000), then=Value(25000)),
            default=Value(30000), output_field=models.CharField())
            ).values('name').annotate(success = Count('name')).order_by('name')
        party_total_specified = party_filtered.annotate(
            name = Case(When(goal_price__range = (1000, 5000), then=Value(5000)), 
            When(goal_price__range = (5000, 10000), then=Value(10000)), When(goal_price__range = (10000, 15000), then=Value(15000)),
            When(goal_price__range = (15000, 20000), then=Value(20000)), When(goal_price__range = (20000, 25000), then=Value(25000)),
            default=Value(30000), output_field=models.CharField())
            ).values('name').annotate(success = Count('name')).order_by('name')

    party_res = []
    temp = {}
    for (item1, item2) in zip(party_specified, party_total_specified) :
        temp = {}
        temp['name'] = item1['name']
        temp['success'] = item1['success']
        temp["created"] = item2["success"]
        party_res.append(temp)
    
    party_res.sort(key=lambda x : -x['success'])

    return JsonResponse({'list' : party_res})

@logger_exception
def get_statistics_graph(request) : # 배열의 첫번째 원소가 가장 과거의 자료여야함. success 랑 created 만 있으면 됨.
    today = timezone.now()
    body = json.loads(request.body.decode('utf-8'))

    res = []
    month_ago = today.replace(day = 1) - timedelta(days = 1) # 저번달 마지막 날
    cnt = 0

    if body["month"] == "이전 3개월" :
        cnt = 3
    elif body["month"] == "이전 6개월" :
        cnt = 6
    elif body["month"] == "이전 12개월" :
        cnt = 12

    for i in range(1, cnt + 1) :
        start_ago = month_ago.replace(day = 1) # 달의 첫날
        party_filtered = Party.objects.filter(created_time__range = (start_ago.date(), month_ago.date()))
        party_completed = party_filtered.filter(status = Party.PartyStatus.COMPLETE)

        res.append({'success' : party_completed.count(), 'created' : party_filtered.count()})
        month_ago = start_ago - timedelta(days = 1)

    return JsonResponse({'list' : res})