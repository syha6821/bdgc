"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 4.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

# 다음을 설치해야 합니다 : pip install django-mathfilters
#
#

from pathlib import Path
import json, os
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

secret_file = os.path.join(BASE_DIR, 'secret.json')

with open(secret_file) as f:
    secrets = json.loads(f.read())

def get_secret(setting, secrets = secrets):
    try : 
        return secrets[setting]
    except KeyError:
        error_msg = "Set the {} environment variable".format(setting)
        raise ImproperlyConfigured(error_msg)

SECRET_KEY = get_secret("SECRET_KEY")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
#SECRET_KEY = 'django-insecure-y$$&2=zu+96x&s0esmq+x&0z&age@s%5*^t^1gu@(pepo=+-9x'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
if DEBUG == True:
    print("DEBUG mode is true!!! pleas check the config/settings/base.py.")

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'common.apps.CommonConfig',
    'delivery.apps.DeliveryConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'mathfilters'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR/'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
)

#이메일 인증 관련
from config import my_settings

# 이메일을 보내는 계정의 보안을 위해, 따로 my_settings.py에 작성.
EMAIL_BACKEND = my_settings.EMAIL['EMAIL_BACKEND'] 
EMAIL_USE_TLS = my_settings.EMAIL['EMAIL_USE_TLS'] 
EMAIL_PORT = my_settings.EMAIL['EMAIL_PORT'] 
EMAIL_HOST = my_settings.EMAIL['EMAIL_HOST'] 
EMAIL_HOST_USER = my_settings.EMAIL['EMAIL_HOST_USER'] 
EMAIL_HOST_PASSWORD = my_settings.EMAIL['EMAIL_HOST_PASSWORD'] 

#PASSWORD_RESET_TIMEOUT_DAYS = 1 # 토큰의 유효기간을 1일로 설정.
PASSWORD_RESET_TIMEOUT = 3600 # 토큰 유효기간 1시간. 3600초

#문의게시판 파일 업로드 관련
import os 
MEDIA_URL = '/media/'   # 프로젝트에 파일 추가해야 에러 없음
MEDIA_ROOT = os.path.join(BASE_DIR.parent, 'media')

# 업로드 파일 크기 제한.
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880 #5mb 이하 , #10485760 10이하

# 브라우저 종료시 세션 만료
# SESSION_EXPIRE_AT_BROWSER_CLOSE = True # 브라우저 닫으면 세션삭제로 로그아웃.

SESSION_COOKIE_AGE = 1209600  # 세션 만료 기간 2주.
SESSION_SAVE_EVERY_REQUEST = True  # 사이트내 액션시 세션만료시간 초기화.

# 장고 로깅 설정.
LOGGING  = {
    'version': 1, # 1으로 고정
    'disable_existing_loggers': False, # 기존의 로거 비활성화 여부
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'formatters': {
        'django.server': {
            '()': 'django.utils.log.ServerFormatter',
            'format': '[{server_time}] {message}',
            'style': '{',
        },
         'standard': { # asctime 현재시간, funcName 함수명, name 로거명, message 로그출력
            'format': '[%(asctime)-10s] (line: %(lineno)d) %(name)s:%(levelname)s - %(message)s'
        },
    },
    'handlers': {
        'console': {# 콘솔 출력
            'level': 'INFO',
            'filters': ['require_debug_true'], #디버깅 모드. true일때 
            'class': 'logging.StreamHandler', 
            'formatter': 'standard',
        },
        'django.server': {# runserver. 개발서버에서 사용
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'django.server', 
        },
        'mail_admins': {# 로그내용을 이메일로 전송. 심한 에러는 바로 메일로
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler' ,
            'formatter': 'standard',
        },
        'file': { # 로그를 파일로 저장. .gitignore 에 logs 추가.
            'level': 'INFO',
            'filters': ['require_debug_false'],
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs/bdgc.log', # 로그 파일 경로. 해당경로 logs파일 없으면 에러발생.
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 5,
            'formatter': 'standard',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'mail_admins' , 'file'],
            'level': 'INFO',
        },
        'django.server': {
            'handlers': ['django.server'],
            'level': 'INFO',
            'propagate': False,
        },
        'common': { # common 로거 생성. 각 앱마다 필요할듯
            'handlers': ['console', 'file' ],
            'level': 'INFO',
        },
        'delivery': { # common 로거 생성. 각 앱마다 필요할듯
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
    }
}