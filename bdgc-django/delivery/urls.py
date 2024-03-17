from django.urls import path

from . import views, apis

app_name = 'party'

urlpatterns = [
    #---------------------------------------views---------------------------------------------------
    path('', views.index, name='index'),
    path('list/', views.index, name='list'),
    path('HowToUse/', views.party_HowToUse, name='HowToUse'),
    path('create/', views.party_create, name='create'),
    path('history/', views.party_history, name='party_history'),
    path('history/<slug:share_id>/', views.party_history_detail, name='party_history_detail'),
    #-------------------------------views end, index apis start-------------------------------------#
    path('get_more_parties/', apis.get_party_list_json, name='get_more_parties'),
    path('get_location_list/', apis.get_location_list, name='get_location_list'),
    path('get_party_by_location/', apis.get_party_by_location, name='get_party_by_location'),
    path('get_joined_party_json/', apis.get_joined_party_json, name='get_joined_party_json'),
    #-------------------------------index apis end, create apis start-------------------------------------#
    #path('create/create_test/', apis.create_test, name='create_test'), # 추후 재확인 : views 와의 통합으로 인한 미사용으로 예상됨.
    path('create/get_restaurant_name_coupang_eats/', apis.get_restaurant_name_coupang_eats, name='api_test'),
    path('create/order_gap_check/', apis.order_gap_check, name='order_gap_check'),
    path('create/check_timer_over_order/', apis.check_timer_over_order, name='ckeck_timer_over_order'),
    #-------------------------------create apis end, other apis start-------------------------------------#
    path('manage/statistics/get_doughnut_data', apis.get_statistics_doughnut, name='get_doughnut_data'),
    path('manage/statistics/get_graph_data', apis.get_statistics_graph, name='get_graph_data'),
]