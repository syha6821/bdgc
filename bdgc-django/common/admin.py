from django.contrib import admin
from .models import User


class UserAdmin(admin.ModelAdmin):
    search_fields = ['identification']


admin.site.register(User, UserAdmin)