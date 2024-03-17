from .base import *
import pdb

#pdb.set_trace()
ALLOWED_HOSTS = ['www.baedalgachi.com' , 'baedalgachi.com'] # 추후 재확인 : 최종 도메인에 맞게 수정.

db_info = os.path.join(BASE_DIR, 'dbinfo_maria.json')

with open(db_info) as f:
    db = json.loads(f.read())

def get_info(setting, db = db):
    try : 
        return db[setting]
    except KeyError:
        error_msg = "Set the {} environment variable".format(setting)
        raise ImproperlyConfigured(error_msg)

db_user = get_info("USER")
db_password = get_info("PASSWORD")

DATABASES = {
    'default': {
        # 'ENGINE': 'django.db.backends.sqlite3',
        # 'NAME': BASE_DIR / 'db.sqlite3',
        'ENGINE' : 'django.db.backends.mysql',
        'NAME' : 'bdgc',
        'USER' : 'root',
        'PASSWORD' : '1234',
        'HOST' : '34.64.127.145',
        'POPT' : ''
    }
}
