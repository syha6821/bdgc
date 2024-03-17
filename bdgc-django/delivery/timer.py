from multiprocessing.synchronize import Lock
import threading
import time
from datetime import datetime, timedelta, tzinfo, timezone
import multiprocessing
from multiprocessing import Manager

from .models import Party

class MatchTimer(threading.Thread) :
    """ 각 파티별 할당 타이머 스레드입니다.
    시간 종료 시, 파티 상태에 변경이 없었다면(=대기중이라면) 타임아웃 동작을 매니저에게 호출합니다.
    """
    party_id = 0
    timer = 60 # 대기시간, 단위 : 분
    manager = None # 참조용 변수.

    def __init__(self, party_id, timer, manager) :
        super(MatchTimer, self).__init__()
        self.party_id = party_id
        self.name = party_id
        self.timer = timer
        self.daemon = True
        self.manager = manager
    
    def run(self) : # 추후 재확인 : 시간 재던 파티가 도중 없어졌다거나 하는 경우 확인해야 함. 
        from .manager import MatchManager
        time.sleep(self.timer * 60)
        current_status = Party.objects.get(party_id=self.party_id).status
        if current_status == Party.PartyStatus.WAIT: # 시간 초과의 경우 (시간이 지났는데 인원이 덜 모인 상황)
            self.manager.do_timeout_action(self.party_id)