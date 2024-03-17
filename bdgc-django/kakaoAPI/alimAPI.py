import hashlib
import hmac
import base64
import requests  # pip install requests
import time
import json

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str as force_text

from delivery.decorator import *

@procedure_logger
def	make_signature(timestamp):
	
	access_key = ""
	secret_key = ""
	secret_key = bytes(secret_key, 'UTF-8')

	method = "POST"
	uri = ""

	message = method + " " + uri + "\n" + timestamp + "\n" + access_key
	message = bytes(message, 'UTF-8')
	signingKey = base64.b64encode(hmac.new(secret_key, message, digestmod=hashlib.sha256).digest())

	return signingKey

@procedure_logger
def sendAuthCodeKakaoAPI(phoneNum ,randNum):

    apiUrl = ""

    content = "인증번호 [ " + randNum + " ] 를 입력해 주세요"


    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "phoneAuth",
        "messages": [
            {
                "to": phoneNum,
                "content": content,
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)

@procedure_logger
def sendHostMatchFinMsgKakaoAPI(phone_num, order_time, store_name, delivery_place , order_info ,delivery_per_price , order_price , openkakao_url):

    apiUrl = ""

    content = "매칭이 완료되었습니다.\n\n" \
        + "어플을 통해서 주문을 시작해주세요.\n" \
        + "■ 주문 예상시간: " + order_time +  "\n\n" \
        + "■ 가게이름: " + store_name + "\n"\
        + "■ 배달장소: " + delivery_place + "\n\n" \
        + "■ 주문내역\n" + order_info + "\n" \
        + "■ 1인당 배달비: " + delivery_per_price + "원 \n" \
        + "■ 총 가격: " + order_price + "원 \n\n" \
        + "오픈카톡주소: " + openkakao_url

    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "matchFin",
        "messages": [
            {
                "to": phone_num,
                "content": content,
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
    

@procedure_logger
def sendMatchFinMsgKakaoAPI(phone_num, order_time, store_name, delivery_place , order_info ,my_order_info,delivery_per_price , my_order_price , openkakao_url):

    apiUrl = ""

    content = "매칭이 완료되었습니다.\n\n"\
        + "■ 주문 예상시간: " + order_time + "\n"\
        + "■ 가게이름: " + store_name + "\n"\
        + "■ 배달장소: " + delivery_place + "\n\n"\
        + "■ 파티 주문내역\n" + order_info + "\n"\
        + "■ 내 주문내역\n" + my_order_info + "\n"\
        + "■ 1인당 배달비: " + delivery_per_price + "원\n"\
        + "■ 내 결제 금액: " + my_order_price + "원\n\n"\
        + "오픈카톡에 참여해 주세요. \n\n"\
        + "오픈카톡주소: " + openkakao_url

    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "matchFinPt",
        "messages": [
            {
                "to": phone_num,
                "content": content,
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
        

@procedure_logger
def sendMatchFailMsgKakaoAPI(phone_num, fail_reason, order_time, store_name, delivery_place , my_order_info):

    apiUrl = ""

    content = "매칭이 실패되었습니다.\n\n" \
        + "■ 실패 사유: " + fail_reason + "\n\n"\
        + "■ 주문 예상시간: " + order_time + "\n" \
        + "■ 가게이름: " + store_name + "\n"\
        + "■ 배달장소: " + delivery_place + "\n\n" \
        + "■ 내 주문내역\n" + my_order_info + "\n\n"

    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "matchFail",
        "messages": [
            {
                "to": phone_num,
                "content": content,
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
    


# ------------------------------------------- 추가 및 변경 알림톡 -------------------------------------------------------------------------------------

# 파티 생성 시 단체 알림톡 전송
@procedure_logger
def sendMatchCreatedMsgKakaoAPI(phone_num, store_name , delivery_place , order_time , minimum_price, delivery_per_price , share_url):

    apiUrl = ""

    content = f"{store_name} 시키실분!\n\n" \
    + f"■ 배달장소 : {delivery_place}\n" \
    + f"■ 주문 예상시간: {order_time}\n\n" \
    + f"■ 최소 참가금액: {minimum_price}\n" \
    + f"■ 1인당 배달비 : {delivery_per_price} \n\n\n" \
    + "* 해당 메시지는 고객님의 알림 신청에 의해 발송되었습니다.\n"\
    + "* 알림을 받기 원하지 않는 경우 마이페이지 -> 알림 받기를 비활성화 해주세요"

    participate_link = f"https://baedalgachi.com/{share_url}"

    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "partyAlim",
        "messages": [
            {
                "to": phone_num,
                "content": content,
                "buttons":[{
                    "type":"WL",
                    "name":"참가하기",
                    "linkMobile":participate_link,
                    "linkPc":participate_link,
                },],
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
# 모집 알림 알림톡
@procedure_logger
def sendAssembleAlimMsgKakaoAPI(phone_num, location_index, is_host, observation_code, user_id):

    apiUrl = ""

    content = "10분 뒤 음식 도착 예정입니다.\n" \
        + "시간에 맞춰 모집 장소로 모여주세요."

    
    user_id_base64 = urlsafe_base64_encode(force_bytes(user_id)) 
    observation_code_base64 = urlsafe_base64_encode(force_bytes(observation_code)) 


    location_link = f"https://baedalgachi.com/check_location?{location_index}"
    food_receive_link = f"https://baedalgachi.com/observation?is_host={is_host}&hashed_Observation={observation_code_base64}&hashed_username={user_id_base64}"

    print(location_link)
    print(type(food_receive_link))
    
    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "asmbleAlim",
        "messages": [
            {
                "to": phone_num,
                "content": content,
                "buttons":[
                    {
                        "type":"WL",
                        "name":"모집장소 확인",  
                        "linkMobile":location_link,
                        "linkPc":location_link,
                    },
                    {
                        "type":"WL",
                        "name":"음식 수령완료",
                        "linkMobile":food_receive_link,
                        "linkPc":food_receive_link,
                    },
                ],
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
    print(f'result of assemble api : {response}')


# 파티장 매칭 완료 알림톡 + 버튼추가
@procedure_logger
def sendHostMatchFinMsgButtonKakaoAPI(phone_num, order_time, store_name, delivery_place , order_info ,delivery_per_price , order_price , openkakao_url , is_host , observation_code , user_id):

    apiUrl = ""

    content = "매칭이 완료되었습니다.\n\n" \
        + "어플을 통해서 주문을 시작해주세요.\n" \
        + "■ 주문 예상시간: " + order_time +  "\n\n" \
        + "■ 가게이름: " + store_name + "\n"\
        + "■ 배달장소: " + delivery_place + "\n\n" \
        + "■ 주문내역\n" + order_info + "\n" \
        + "■ 1인당 배달비: " + delivery_per_price + "원 \n" \
        + "■ 총 가격: " + order_price + "원 \n\n" \
        + "오픈카톡주소: " + openkakao_url + "\n\n" \
        + "배달 도착 10분 전에,\n" \
        + "파티원들에게 알림을 보내세요."


    user_id_base64 = urlsafe_base64_encode(force_bytes(user_id)) 
    observation_code_base64 = urlsafe_base64_encode(force_bytes(observation_code)) 

    assamble_alim_link = f"https://baedalgachi.com/observation?is_host={is_host}&hashed_Observation={observation_code_base64}&hashed_username={user_id_base64}"

    print(assamble_alim_link)
    print(type(assamble_alim_link))


    timestamp = str(int(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': '',
        'x-ncp-apigw-signature-v2': make_signature(timestamp),
    }

    body = {
        "plusFriendId": "@배달가치",
        "templateCode": "finishHost",
        "messages": [
            {
                "to": phone_num,
                "content": content,
                "buttons":[
                {
                    "type":"WL",
                    "name":"모집알림 전송",
                    "linkMobile":assamble_alim_link,
                    "linkPc":assamble_alim_link,
                }
            ],
            }
        ],
    }

    apiData = json.dumps(body)

    response = requests.post(url= apiUrl, headers=headers, data=apiData)
