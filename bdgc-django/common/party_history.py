from django.shortcuts import render, redirect
from django.http import HttpResponse,  JsonResponse
from requests import RequestException
from .models import User 
from delivery.models import Party , Order
from django.db.models import Q, F, When, Case, When, Count, Subquery, OuterRef, Value

#로깅설정
import logging
logger = logging.getLogger('common')

# json
import json

# 페이징
from django.core.paginator import Paginator  


# 문의 게시판 글
def viewMyPartyHistory(request):
    if request.method == "GET":

        try:
            
            user = User.objects.get(user_id = request.session['user'])
            page = request.GET.get('page', '1')  # 페이지
            
            order_list = Order.objects.filter(Q(user_identification = user.identification) & Q(party_id__status = Party.PartyStatus.COMPLETE))
            order_ref = order_list.filter(party_id = OuterRef('party_id'))
            
            party_list = Party.objects.filter(Q(status = Party.PartyStatus.COMPLETE)).filter(party_id = Subquery(order_ref.values('party_id')[:1])).order_by('-created_time')
            
            paginator = Paginator(party_list, 10)  # 페이지당 10개씩 보여주기
            page_obj = paginator.get_page(page)

            context = {'party_list' : page_obj}
            return render(request, 'common/party_history.html', context)

        except User.DoesNotExist:  
            return redirect('/common/login')

        except Exception as e:
            print(e)
            return render(request, 'error.html', {"error" :"파티 기록 리스트 조회 중 서버에러 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

def detailPartyHistory(request, share_id):

    if request.method == "GET":

        try:
            
            user = User.objects.get(user_id = request.session['user'])
             
            party_id = Party.objects.get(share_id = share_id).party_id
                
            
            party: Party = Party.objects.get(party_id = party_id)
            if party.host_identification == user.identification :
                order_list = Order.objects.filter(party_id = party_id)
            else :
                order_list = Order.objects.filter(Q(party_id = party_id) & Q(user_identification = user.identification))
            return render(request, 'common/party_detail.html', context={'party' : party, 'order_list' : order_list})
        
        
        except User.DoesNotExist:  
            return render(request, 'error.html', {"error" :"로그인을 확인해주세요"})

        
        except Party.DoesNotExist:
            return render(request, 'error.html', {"error" :"찾으시는 파티가 없습니다"})

        except Exception as e:
            print(e)
            return render(request, 'error.html', {"error" :"파티 기록 정보 조회 중 서버에러 발생"})    
    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

