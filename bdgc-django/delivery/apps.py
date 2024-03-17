from django.apps import AppConfig


class DeliveryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'delivery'
    

    def ready(self) : 
        #print('주의 : 아무런 Initiation 작업도 시행되지 않았습니다! delivery/apps.py 를 확인하세요.') # 추후 재확인 : 로깅으로
        #return
        #Custon task start : 
        from .manager import MatchManager
        MatchManager.__init__()
