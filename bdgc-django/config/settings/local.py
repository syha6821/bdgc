from .base import *

DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

db_info = os.path.join(BASE_DIR, 'dbinfo.json')

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
        #'ENGINE': 'django.db.backends.sqlite3',
        #'NAME': BASE_DIR / 'db.sqlite3',
        'ENGINE' : 'django.db.backends.mysql',
        'NAME' : 'bdgc',
        'USER' : db_user,
        'PASSWORD' : db_password,
        'HOST' : 'localhost',
        'POPT' : ''
    }
}
