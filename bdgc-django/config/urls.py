"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import View
from django.conf import settings 
from django.conf.urls.static import static 

from delivery import views, apis

urlpatterns = [
    path('admin/2C68318E35/', admin.site.urls), # 관리자 전용 페이지!!!
    path('', views.index, name='index'), # 메인 화면
    path('common/', include('common.urls')),
    path('party/', include('delivery.urls')),
    path('<slug:share_id>/', views.quick_join, name='quick_join'), #공유 URL 매칭, 이름 바꿔볼 필요 있을 듯.
    path('<slug:share_id>/join/', views.JoinView.as_view(), name='join'), # 파티 참여 페이지
    path('<slug:share_id>/join/check_total_prices_ovev_min/', apis.check_total_prices_over_min, name='check_total_prices_over_min'), # 파티 참여 페이지
    path('<slug:share_id>/leave/', views.party_leave, name='leave'),
    path('list', views.index_list, name='index_list'),
    path('observation', apis.observation_btn_procedure, name='observation_btn_procedure'), # 추후 재확인
    path('check_location', views.party_check_location, name='party_check_location'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
