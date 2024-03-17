from django.contrib import admin
from .models import *

# Register your models here.

class PartyAdmin(admin.ModelAdmin):
    search_fields = ['restaurant_name']


class OrderAdmin(admin.ModelAdmin) :
    search_fields = ['order_id']

class LocationAdmin(admin.ModelAdmin) :
    location_fields = ['location_name_small']

class ObservationAdmin(admin.ModelAdmin) :
    observation_fields = ['observation_id']

admin.site.register(Party, PartyAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(Observation, ObservationAdmin)