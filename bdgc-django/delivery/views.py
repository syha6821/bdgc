import json
from multiprocessing import Manager
import base64
import hashlib
from os import urandom

from django.http import JsonResponse
from django.views.generic import View
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone as tz
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator
from django.contrib import messages
from django.db.models import Q, F, When

from delivery.apis import get_joined_party_json

from .models import *
from .forms import PartyForm, JoinForm
from .manager import *
from .validate import *
from .query import *
from .decorator import *

from common.models import User

from .decorator import view_logger_func, view_logger_method
# 추후 재확인 : 안 쓰는 모든 주석들 다 지우기.

# Create your views here.

    
@logger_exception
def index_list(request) : # 추후 재확인 : Annotating 을 하단의 함수로 대체해볼 것
    #메인 파티 조회 화면 출력
    if 'search_before' in request.session :
        request.session.pop('search_before')
    if 'last_obj' in request.session :
        request.session.pop('last_obj')
    
    joined_list = {} # 가입된 파티가 있는지
    location_default = str('')

    if 'user' in request.session :
        joined_list = get_joined_party(request.session['user']) # 가입된 파티 목록을 받아옴.
        #default_place = User.objects.get(user_id = request.session['user']).place

    context = {
                'joined_list' : joined_list,
                'location_default' : location_default
                }
    get_joined_party_json(request=request)
    return render(request, 'mainpage_v2.html', context)

@logger_exception
def index(request) : # 
    #메인 파티 조회 화면 출력
    if 'search_before' in request.session :
        request.session.pop('search_before')
    if 'last_obj' in request.session :
        request.session.pop('last_obj')
    
    joined_list = {} # 가입된 파티가 있는지
    location_default = str('')

    if 'user' in request.session :
        joined_list = get_joined_party(request.session['user']) # 가입된 파티 목록을 받아옴.
        #default_place = User.objects.get(user_id = request.session['user']).place

    context = {
                'joined_list' : joined_list,
                'location_default' : location_default
                }
    get_joined_party_json(request=request)
    return render(request, 'mainpage_v2_test.html', context)


@view_logger_func
def party_HowToUse(request) : # 추후 재확인 : 테스트 용으로 우려먹기중.

    if 'search_before' in request.session :
        request.session.pop('search_before')
    if 'last_obj' in request.session :
        request.session.pop('last_obj')

    return render(request, 'delivery/party_HowToUse.html')

@logger_exception
def party_check_location(request) :
    return render(request, 'delivery/party_location.html') # 주의! 정확히 정해지자마자 바로 바꿀 것.


#----------------------------파티 생성----------------------------------
@view_logger_func
@is_authenticated
@transaction
def party_create(request) : 

    if get_concurrent_participate(request.session['user']) >= 2 :
            # messages.error(request, '동시에 최대 2개의 파티에만 소속할 수 있습니다.')
            # return redirect('index')
            return render(request, 'error.html', {"error" :"동시에 최대 2개의 파티에만 소속할 수 있습니다"})
    if count_belong_today(request.session['user']) >= 10 :
            # messages.error(request, '하루에 최대 10번만 파티에 참가하실 수 있습니다.')
            # return redirect('index')
            return render(request, 'error.html', {"error" :"하루에 최대 10번만 파티에 참가하실 수 있습니다"})

    if request.method == 'POST' :
        try :
            message = ""
            body = json.loads(request.body.decode('utf-8'))
            host = get_user_identification(request.session['user'])
            order_predict = body['order_predict'].split(':')
            end_time = body['party_ending_time'].split(':')

            timer = int((get_incoming_datetime(hours=int(end_time[0]), minutes=int(end_time[1])) - timezone.now()).seconds/60)

            if is_order_gapped(request.session['user'], int(order_predict[0]), int(order_predict[1])) != True :
                message = '주문 예상 시각을 최근 주문 시간과 최소 30분 이상 차이나게 설정해주세요.'
                return JsonResponse({'success' : False, 'message' : message, 'share_url' : ''})

            if is_timer_over_order(hour=int(order_predict[0]), minute=int(order_predict[1]), timer=timer) :
                message = f'파티 종료 시간이 주문 예상 시간보다 길 수 없습니다.'
                return JsonResponse({'success' : False, 'message' : message, 'share_url' : ''})
        
            party = create_party(body, host, timer, order_predict)
            party.save()

            for receipt in body['receipt'] :
                order = create_order(receipt, party, host)
                if party.current_price == 1 :
                    party.current_price += (order.menu_price * order.menu_amount) - 1
                else :
                    party.current_price += order.menu_price * order.menu_amount
                order.save()
                party.save()
            hash_value = str(party.party_id)
            while(True) :
                hashed = hashlib.sha512((hash_value + str(urandom(10))).encode('utf-8'))
                hash_value = base64.b32encode(hashed.digest()).decode('utf-8')[:10]
                check_list = Party.objects.filter(share_id = hash_value)
                if check_list.count() == 0 :
                    break
            
            party.share_id = hash_value
            party.save()
            MatchManager.create_timer(party_id=party.party_id, timer=party.timer)
            MatchManager.send_notify_message(party_id=party.party_id)
        
        except Exception as e :
            raise

        return JsonResponse({'success' : True, 'message' : '파티 생성에 성공하였습니다.', 'share_url' : f'https://baedalgachi.com/{party.share_id}'})
    else : # GET
        form = PartyForm()
        return render(request, 'delivery/makeparty_v2.html', {'form' : form, })#'location_list' : location_list})

#----------------------------파티 참가-----------------------------------
@logger_exception
def quick_join(request, share_id) :
    try : 
        party_id = Party.objects.get(share_id = share_id).party_id
    except :
        return render(request, 'error.html', {"error" :"찾으시는 파티가 없습니다"})

    party: Party = Party.objects.get(party_id = party_id)
    
    if party.status != Party.PartyStatus.WAIT : # 종료된 파티 참여 시도
        return render(request, 'error.html', {"error" :"모집중인 파티가 아닙니다"})

    
    joined_list = {} # 가입된 파티가 있는지
    
    if 'user' in request.session :
        joined_list = get_joined_party(request.session['user']) # 가입된 파티 목록을 받아옴.

    participation_fee = int((party.goal_price - party.current_price) / (party.required_people_number - party.headcount))
    if participation_fee < 0 :
        participation_fee = 0
    left_time = int(((party.created_time + timedelta(minutes=party.timer)) - timezone.now()).seconds / 60)
    location_name_small = party.location.location_name_small
    location_x = party.location.location_x
    location_y = party.location.location_y
    order_time = party.order_time.strftime('%H시%M분')
    join_url = f'/{party.share_id}/join'
    restaurant_link = party.restaurant_link

    context = {'party' : party, 'joined_list' : joined_list, 'participation_fee' : participation_fee, 'left_time' : left_time, 'join_url' : join_url, 'restaurant_link' : restaurant_link,
                'location_name_small' : location_name_small, 'order_time' : order_time, 'location_x' : location_x, 'location_y' : location_y}
    return render(request, 'share_url.html', context)

#----------------------------파티 참가 클래스 뷰--------------------------
class JoinView(View) :

    party : Party = None
    status : Party.PartyStatus = None
    required_minimum_price = None
    party_id = None
    __name__ = 'JoinView'

    @view_logger_method
    @method_decorator(is_authenticated)
    @method_decorator(transaction)
    @method_decorator(concurrency)
    def dispatch(self, request, share_id, *args, **kwargs) :
        if get_concurrent_participate(request.session['user']) > 2 :
            if request.method == 'GET':
                return render(request, 'error.html', {"error" :"동시에 최대 2개의 파티에만 소속할 수 있습니다"})
            else:
                return JsonResponse( { 'success' : False , 'message' : "동시에 최대 2개의 파티에만 소속할 수 있습니다" })

        if count_belong_today(request.session['user']) > 10 :
            if request.method == 'GET':
                return render(request, 'error.html', {"error" :"하루에 최대 10번만 파티에 참가하실 수 있습니다"})
            else:
                return JsonResponse( { 'success' : False , 'message' : "하루에 최대 10번만 파티에 참가하실 수 있습니다" })

        try : 
            self.party_id = Party.objects.get(share_id = share_id).party_id
        except :
            return render(request, 'error.html', {"error" :"알 수 없는 이유로 작업에 실패하였습니다"})

        self.party = Party.objects.get(party_id = self.party_id)
        self.status = self.party.status
        if self.status != Party.PartyStatus.WAIT : # 종료된 파티 참여 시도
            if request.method == 'GET':
                return render(request, 'error.html', {"error" :"모집중인 파티가 아닙니다!"})
            else:
                return JsonResponse( { 'success' : False , 'message' : "모집중인 파티가 아닙니다!" })

        if is_joining_again(user_id=request.session['user'], party_id = self.party_id) : # 파티 중복 참여 시도
            if request.method == 'GET':
                return render(request, 'error.html', {"error" :"이미 가입된 파티입니다!"})
            else:
                return JsonResponse( { 'success' : False , 'message' : "이미 가입된 파티입니다!" })

        self.required_minimum_price = get_required_minimum_price(party_id = self.party_id)

        return super(JoinView, self).dispatch(request, share_id, *args, **kwargs)


    def get(self, request, party_id) :
        restaurant_name = self.party.restaurant_name
        form = JoinForm()
        context = {'restaurant_name' : restaurant_name, 'required_minimum_price' : self.required_minimum_price, 'restaurant_link' : self.party.restaurant_link}
        return  render(request, 'delivery/joinparty.html', context)

    def post(self, request, party_id) :
        try:
            body = json.loads(request.body.decode('utf-8'))
            host = get_user_identification(request.session['user'])

            self.party = Party.objects.get(party_id = self.party_id)
            self.status = self.party.status

            if self.status != Party.PartyStatus.WAIT : # 종료된 파티 참여 시도
                return JsonResponse( { 'success' : False , 'message' : "모집중인 파티가 아닙니다!" })

            required_minimum_price = self.required_minimum_price

            total_min = 0
            for receipt in body['receipt'] :
                total_min += receipt[1] * receipt[2]
        
            if total_min < int(required_minimum_price) :
                return JsonResponse({'success' : False, 'message' : '최소 참가 금액 이상으로 주문해주세요.', 'share_url' : f''})

            for receipt in body['receipt'] :
                order = create_order(receipt, self.party, host)
                if self.party.current_price == 1 :
                    self.party.current_price += (order.menu_price * order.menu_amount) - 1
                else :
                    self.party.current_price += order.menu_price * order.menu_amount
                if body['receipt'].index(receipt) == 0 :
                    order.personal_request = body['personal_request']
                order.save()
                self.party.save()
            self.party.headcount += 1
            self.party.save()
            if self.status != Party.PartyStatus.WAIT : # 종료된 파티 참여 시도
                raise Exception('모집중인 파티가 아닙니다!')
            if(self.party.required_people_number == self.party.headcount) :
                MatchManager.do_complete_action(party_id=self.party.party_id)
        except Exception as e :
            get_logger().exception(e)
            return JsonResponse({'success' : False, 'message' : e, 'share_url' : f''})
        return JsonResponse({'success' : True, 'message' : '파티 참가에 성공하셨습니다!', 'share_url' : f'https://baedalgachi.com/{self.party.share_id}'})


#----------------------------파티 참가 클래스 뷰 마지막--------------------
#-------------------------------------파티 탈퇴, 해체----------------------------------------
@view_logger_func
@is_authenticated
@transaction
@concurrency
def party_leave(request, share_id) :
    try : 
        party_id = Party.objects.get(share_id = share_id).party_id
    except :
        return render(request, 'error.html', {"error" :"찾으시는 파티가 없습니다"})
    party: Party = Party.objects.get(party_id = party_id)

    host = party.host_identification
    user = User.objects.get(user_id = request.session['user'])

    if party.status != Party.PartyStatus.WAIT :
        return render(request, 'error.html', {"error" :"잘못된 접근입니다!"})

    if host == user.identification : # 해체
        orderlist = Order.objects.filter(party_id = party_id) # 추후 재확인 : 여기다가도 파티 상태 검사할 필요 있을 듯.
        for order in orderlist :
            order.is_exit = True
            order.save()
        MatchManager.do_break_up_action(party_id=party.party_id)
        return redirect('/')
    else : # 탈퇴
        orders = Order.objects.filter(user_identification = user.identification).filter(Q(party_id = party.party_id) & Q(is_exit = False))
        if orders.count() <= 0 :
            return render(request, 'error.html', {"error" :"잘못된 접근입니다!"})
        for order in orders : 
            party.current_price -= order.menu_price * order.menu_amount
            order.is_exit = True
            order.save()
        party.headcount -= 1
        party.save()
        return redirect('/')

#-------------------------------------참가 기록----------------------------------------------
@view_logger_func
@is_authenticated
def party_history(request) :
    user = User.objects.get(user_id = request.session['user'])
    order_list = Order.objects.filter(Q(user_identification = user.identification), Q(party_id__status = Party.PartyStatus.COMPLETE))
    order_ref = order_list.filter(party_id = OuterRef('party_id'))
    party_list = Party.objects.filter(Q(status = Party.PartyStatus.COMPLETE)).filter(party_id = Subquery(order_ref.values('party_id')[:1]))

    return render(request, 'delivery/party_history.html', context={'party_list' : party_list})
    
@view_logger_func
@is_authenticated
def party_history_detail(request, share_id) :
    user = User.objects.get(user_id = request.session['user'])
    try : 
        party_id = Party.objects.get(share_id = share_id).party_id
    except :
        return render(request, 'error.html', {"error" :"찾으시는 파티가 없습니다"})
    party: Party = Party.objects.get(party_id = party_id)
    if party.host_identification == user.identification :
        order_list = Order.objects.filter(party_id = party_id)
    else :
        order_list = Order.objects.filter(Q(party_id = party_id) & Q(user_identification = user.identification))
    return render(request, 'delivery/party_history_detail.html', context={'party' : party, 'order_list' : order_list})
#-------------------------------------축약용 임시 함수----------------------------------------
@logger_exception
def create_party(data, host, timer, order_time) : #아래는 DB 저장용 임시 구현 코드, 좀 더 깔끔한 정리가 필요
    try :
        party = Party()
        party.host_identification = host
        party.restaurant_name = data['store_name']
        party.restaurant_link = data['store_link']
        party.open_kakao_link = data['kakao_link']
        party.goal_price = data['goal_price']
        party.delivery_cost = data['delivery_fee']
        party.delivery_cost_per_person = data['delivery_fee'] / data['people_number']
        party.location = create_location(data=data) # 추후 재확인 
        party.required_people_number = data['people_number']
        party.category = data['category'] # '220604 추가.
        party.timer = timer
        party.status = 'W8'
        party.current_price = 1
        party.headcount = 1
        party.created_time = tz.now()
        finish_time = get_incoming_datetime(hours=int(order_time[0]), minutes=int(order_time[1]))
        party.order_time = finish_time
        party.full_clean()
    except Exception as e :
        raise
    return party

@logger_exception
def create_order(receipt, party, orderer) :
    order = Order(party_id = party, 
            user_identification = orderer, 
            menu_name = receipt[0], 
            menu_price = receipt[1], 
            menu_amount = receipt[2], 
            personal_request = ' ' if len(receipt) <= 3 else receipt[3],
            attendance_time = tz.now(),
            is_exit = False)
    order.full_clean()
    return order

@logger_exception
def create_location(data) :
    location = Location(
        location_name_small = data['location_name_small'],
        location_name_big = data['location_name_big'],
        location_x = float(data['location_x']),
        location_y = float(data['location_y'])
    )
    location.full_clean()
    location.save()
    return location