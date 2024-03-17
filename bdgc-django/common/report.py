from django.shortcuts import render, redirect
from django.http import HttpResponse,  JsonResponse
from requests import RequestException
from .models import Report , User

# 시간 관련
from django.utils import timezone # settings 내에서 SET_TZ = False 필요. 아니면 시차생김
# create_date= timezone.now().strftime("%Y-%m-%d %H:%M:%S") 형식


#로깅설정
import logging
logger = logging.getLogger('common')

# 아이피 추출
from config.get_client_ip import get_client_ip

# json
import json

#파일형식 검사
from django.core.validators import FileExtensionValidator 
from django.core.exceptions import ValidationError


# 페이징
from django.core.paginator import Paginator  


# 문의 게시판 글
def viewMyReport(request):
    if request.method == "GET":

        try:

            user_id = request.session.get('user')
            user = User.objects.get(user_id=user_id)
            page = request.GET.get('page', '1')  # 페이지
            report_list = Report.objects.filter(upload_user_id = user.identification).order_by('-created_time')
            
            paginator = Paginator(report_list, 10)  # 페이지당 10개씩 보여주기
            page_obj = paginator.get_page(page)
            context = {'report_list' : page_obj}
            return render(request, 'common/report_list.html', context)

        except User.DoesNotExist:  
            return redirect('/common/login')

        except:
            return render(request, 'error.html', {"error" :"서버에러 발생"})

    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

def detailReport(request, report_id):

    if request.method == "GET":

        try:
            report= Report.objects.get(report_id = report_id)
            context = {'report' : report}
            return render(request, 'common/report_detail.html', context)
     
        except:
            return render(request, 'error.html', {"error" :"관리자 로그인 도중 서버에러 발생"})
            
    else:
        return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})



def uploadReport(request):

    try:    # 요청시 로그인 체크
    
        user_id = request.session.get('user')
        login_user = User.objects.get(user_id=user_id)

        if request.method == "GET":

            return render(request, 'common/report_upload.html')

        elif request.method == "POST":

            try:
                logger.info(str(get_client_ip(request)) + " : 문의 업로드 요청")

              
                input_title = request.POST.get('input_title')
                input_type = request.POST.get('input_type')
                input_reason = request.POST.get('input_reason')
                input_file = request.FILES.get('input_file' , False)

            
                if not (input_title and input_type and input_reason):
                    return render(request, 'error.html', {"error" :"모든 항목을 입력해주세요"})

                # 파일 형식 검사
                if not (input_file == False):
                    validFileExtensions = FileExtensionValidator(["jpg", "jpeg", "png"])
                    validFileExtensions(input_file)


                # !! 프로젝트 경로에 media 폴더 생성 필요 !! 
                report = Report(
                    upload_user_id = login_user.identification,
                    title = input_title,
                    type = input_type,
                    reason = input_reason,
                    file_path = input_file,
                    created_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
                    status = "접수완료"
                )

                report.save()

                return redirect ('/common/myPage/report_upload_success')
                # return JsonResponse({'message': '업로드 성공' , 'success': True})

            except ValidationError :
                return render(request, 'error.html', {"error" :"파일 형식 오류. 이미지 파일을 업로드 해주세요"})
                # return JsonResponse({'message': '파일 형식 오류. 이미지 파일을 업로드 해주세요' , 'success': False})
            except:
                return render(request, 'error.html', {"error" :"문의 업로드 도중 서버에러 발생"})
                # return JsonResponse({'message': '서버에러 발생' , 'success': False})

        
        else:
            return render(request, 'error.html', {"error" :"올바른 접근이 아닙니다"})

    except User.DoesNotExist:
       return render(request, 'error.html', {"error" :"로그인을 확인해 주세요"})

    except:
        return render(request, 'error.html', {"error" :"문의 업로드 중 서버에러 발생"})


def uploadReportSuccess(request):
    if request.method == "GET":   
        return render(request, 'common/report_upload_success.html')


