from datetime import datetime, timedelta, tzinfo
import multiprocessing

from django.utils import timezone
from django.db.models import Q

from .models import Observation, Party, Order, Location
from common.models import User

from .timer import MatchTimer
from .decorator import procedure_logger, print_log, transaction

# 알림톡 전송
from kakaoAPI.alimAPI import *

class MatchManager : # 추후 재확인 필요 : 최적화 해야함. 특히, is_inited 써놓고 굳이 아래에서 하나씩 만들 때마다 또 하나씩 집어넣을 필요 있을까?
    IPC_memory = {}
    lock = {}

    @classmethod
    @procedure_logger
    def __init__(cls) :

        if cls.IPC_memory.get('is_inited', False) :
            return

        cls.IPC_memory = multiprocessing.Manager().dict() # 공유 메모리 참조 변수 획득

        # 관리할 매치 프로세스 초기화
        w8_list = Party.objects.filter(status = Party.PartyStatus.WAIT) # 대기중인 파티들

        for party in w8_list :
            if (party.party_id in cls.IPC_memory) != True : # 현재 프로세스의 매치 관리자에 해당 파티가 없을 경우
                estimated_finish_time : datetime = party.created_time + timedelta(minutes=party.timer) # 파티의 추정 종료시간
                now = timezone.now() # 현재시간
                if now < estimated_finish_time : # 아직 대기시간이 남은 파티만 추가.
                    if party.required_people_number == party.headcount : # 매치 성사 처리하다가 종료된 경우
                        cls.do_complete_action(party_id= party.party_id)
                    if cls.is_party_broken(party_id = party.party_id) : # 파티 해산 처리하다가 종료된 경우
                        cls.do_break_up_action(party_id = party.party_id)
                    now = timezone.now() # 정확한 시간 계산을 위해 다시한번 로딩
                    remain_time : timedelta = estimated_finish_time - now
                    remain_minute = remain_time.seconds / 60
                    cls.create_timer(party_id = party.party_id, timer = remain_minute)
                    cls.IPC_memory[party.party_id] = True
                else : # 타임아웃 처리하다가 종료된 경우
                    cls.do_timeout_action(party_id=party.party_id)
            else : # 추후 재확인 : 멀티프로세싱 시험용 (공유메모리)
                print_log('Some worker has initiated the party : ' + str(party.party_id) + ', and this process is ' + str(multiprocessing.Process.pid))
        cls.IPC_memory['is_inited'] = True
        return

    @classmethod
    def is_party_broken(cls, party_id) :
        status = Party.objects.filter(party_id = party_id).first().status
        if status == Party.PartyStatus.BREAKUP :
            return True
        else :
            return False
    
    @classmethod
    @procedure_logger
    def create_timer(cls, party_id, timer) : 
        match = MatchTimer(party_id=party_id, timer=timer, manager=cls)
        print_log(f'Match created : {str(party_id)} from {str(multiprocessing.Process.pid)}') # 추후 재확인
        match.start()
        return

    @classmethod
    @procedure_logger
    def send_notify_message(cls, party_id) :
        party : Party = Party.objects.get(party_id = party_id)
        userlist = User.objects.filter(Q(place = party.location.location_name_big) & Q(is_alim_allowed = True)).exclude(identification = party.host_identification) # 추후 재확인 : 사용자의 알림 수신 설정에 따라 안 받을 사람
        user : User
        for user in userlist :
            sendMatchCreatedMsgKakaoAPI(user.phone_number, party.restaurant_name, party.location.location_name_small, party.order_time.strftime('%H시%M분'), 
            int(party.goal_price - party.current_price / (party.required_people_number - party.headcount)), party.delivery_cost_per_person, party.share_id)
        return

    @classmethod
    @transaction
    @procedure_logger
    def do_complete_action(cls, party_id) : 
        # 추후 재확인 : 알림톡으로 참여자들에게 공시
        party : Party = Party.objects.get(party_id = party_id)
        party.status = Party.PartyStatus.COMPLETE
        party.save()
        orders = Order.objects.filter(party_id = party_id)
        for order in orders :
            order.is_exit = True
            order.save()
        #해당 파티에 속한 유저 다 끌고와서 감시 모델 하나씩 다 만듦.
        #

        order_list = Order.objects.filter(party_id = party_id)
        id_list = order_list.values('user_identification')
        user_list = User.objects.filter(identification__in = id_list)
        
        user : User
        for user in user_list :
            user.manner_score += 1
            user.save()

        order_info = str('')
        total_prices = 0

        for user in user_list :
            observe = Observation()
            observe.party_id = party
            observe.user_identification = user.identification
            observe.is_button_pressed = False
            observe.save()
            order_info += f'{user.nick_name}({user.identification})\n'
            order_user = order_list.filter(user_identification = user.identification)
            personal_request = str('')
            my_order_info = str('')
            my_order_total_prices = 0

            #주문정보 order_info
            for order in order_user :
                my_order_info += f'•{order.menu_name}({str(order.menu_amount)}개)\n'
                my_order_total_prices += order.menu_price * order.menu_amount
                if len(order.personal_request) > 0 :
                    personal_request = order.personal_request

         
            order_info += my_order_info
            order_info += f'{personal_request}\n'
            total_prices += my_order_total_prices

        for user in user_list :
            
            if (user.identification == party.host_identification):
                sendHostMatchFinMsgButtonKakaoAPI(
                    str(user.phone_number),
                    str(party.order_time.strftime('%H시 %M분')),
                    str(party.restaurant_name),
                    str(party.location.location_name_small),
                    order_info,
                    str(party.delivery_cost_per_person),
                    str(party.current_price),
                    str(party.open_kakao_link),
                    "host",
                    Observation.objects.get(Q(user_identification = user.identification) & Q(party_id = party_id)).observation_id,
                    str(user.identification),
                    )

            else:
                order_user = order_list.filter(user_identification = user.identification)
                personal_request = str('')
                my_order_info = str('')
                my_order_total_prices = 0

                #주문정보 order_info
                for order in order_user :
                    my_order_info += f'•{order.menu_name}({str(order.menu_amount)}개)\n'
                    my_order_total_prices += order.menu_price * order.menu_amount
                    if len(order.personal_request) > 0 :
                        personal_request = order.personal_request
                
                sendMatchFinMsgKakaoAPI(
                    str(user.phone_number),
                    str(party.order_time.strftime('%H시 %M분')),
                    str(party.restaurant_name),
                    str(party.location.location_name_small),
                    order_info,
                    my_order_info,
                    str( party.delivery_cost_per_person),
                    str(my_order_total_prices),
                    str(party.open_kakao_link))
 
        print_log(f'Party {str(party_id)} has completed!')
        return

    @classmethod
    @procedure_logger
    def do_break_up_action(cls, party_id) : 
        # 추후 재확인 : 알림톡으로 참여자들에게 공시
        party = Party.objects.get(party_id = party_id)
        party.status = Party.PartyStatus.BREAKUP
        party.save()
        orders = Order.objects.filter(party_id = party_id)
        for order in orders :
            order.is_exit = True
            order.save()

        order_list = Order.objects.filter(party_id = party_id)
        id_list = order_list.values('user_identification')
        user_list = User.objects.filter(identification__in = id_list)


        fail_reason = "파티장이 파티를 해체했습니다"

        for user in user_list :

            order_user = order_list.filter(user_identification = user.identification)
            my_order_info = str('')

            #주문정보 order_info
            for order in order_user :
                my_order_info += f'•{order.menu_name}({str(order.menu_amount)}개)\n'
           
            sendMatchFailMsgKakaoAPI(
                str(user.phone_number),
                fail_reason,
                str(party.order_time.strftime('%H시 %M분')),
                str(party.restaurant_name),
                str(party.location.location_name_small),
                my_order_info
            )

        print_log(f'Party {str(party_id)} has broken up!')

        return

    @classmethod
    @procedure_logger
    def do_timeout_action(cls, party_id) : 
        if party_id not in cls.lock :
            cls.lock[party_id] = multiprocessing.Lock()
        
        cls.lock[party_id].acquire(block=True, timeout=6)
        # 추후 재확인 : 알림톡으로 참여자들에게 공시
        party = Party.objects.get(party_id = party_id)
        party.status = Party.PartyStatus.TIMEOUT
        party.save()
        orders = Order.objects.filter(party_id = party_id)
        for order in orders :
            order.is_exit = True
            order.save()
        

        order_list = Order.objects.filter(party_id = party_id)
        id_list = order_list.values('user_identification')
        user_list = User.objects.filter(identification__in = id_list)


        fail_reason = "시간안에 파티원이 모집되지 않아 자동으로 파티가 종료되었습니다"

        for user in user_list :

            order_user = order_list.filter(user_identification = user.identification)
            my_order_info = str('')

            #주문정보 order_info
            for order in order_user :
                my_order_info += f'•{order.menu_name}({str(order.menu_amount)}개)\n'
           
            sendMatchFailMsgKakaoAPI(
                str(user.phone_number),
                fail_reason,
                str(party.order_time.strftime('%H시 %M분')),
                str(party.restaurant_name),
                str(party.location.location_name_small),
                my_order_info
            )
        print_log(f'Party {str(party_id)} has been Time Out!')
        try :
            cls.lock[party_id].release()
        except Exception as e :
            raise
        return

    @classmethod
    @procedure_logger
    def assemble_btn_pressed(cls, party_id, host_username) :
        host : User = User.objects.get(identification = host_username)
        host.manner_score += 5
        host.save()

        user_pk_list = Observation.objects.filter(party_id = party_id).values('user_identification')
        user_list = User.objects.filter(identification__in = user_pk_list).exclude(identification = host_username)
        party : Party = Party.objects.get(party_id = party_id.party_id)
        coordinate_str = 'x=' + str(party.location.location_x) + '&y=' + str(party.location.location_y)

        user : User
        for user in user_list :
            # location_index = 지도 좌표는 아직 구현 안함.
            obs : Observation = Observation.objects.filter(Q(user_identification = user.identification) & Q(party_id = party_id)).first()
            sendAssembleAlimMsgKakaoAPI(user.phone_number, coordinate_str, "not_host", obs.observation_id, user.identification)
        

    @classmethod
    @procedure_logger
    def recieve_btn_pressed(cls, party_id, user_id) :
        participant = User.objects.get(user_id = user_id)
        participant.manner_score += 5
        participant.save()


    @classmethod
    def acquire(cls, share_id) :
        try : 
            party_id = Party.objects.get(share_id = share_id).party_id
        except :
            raise
        if party_id not in cls.lock :
            cls.lock[party_id] = multiprocessing.Lock()
            
        return cls.lock[party_id].acquire(block=True, timeout=6)
        #return cls.lock.acquire(block=True, timeout=6)

    @classmethod
    def release(cls, share_id) :
        try : 
            party_id = Party.objects.get(share_id = share_id).party_id
        except :
            raise
        cls.lock[party_id].release()
        

