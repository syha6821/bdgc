from django import template

from delivery.models import Party

register = template.Library()


@register.filter
def is_joined_in(party_id : int, joined_list):
    for join in joined_list :
        if party_id == join['party_id'] :
            return True
    return False

@register.filter
def sub_prices(goal : int, current : int) -> int :
    min = goal - current
    if min < 0 :
        return 0
    else :
        return min