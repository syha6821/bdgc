
def get_url_after_login(request) :
    url = request.build_absolute_uri()
    if url.find("?") == -1 :
        return str('/')

    params : str = url.split('?')[1]
    target_url = params

    if params.find("&") != -1 :
        target_url = params.split('&')[0]

    target_url : str = target_url.split('=')[1]
    url_list = target_url.split('_')
    whole_url = str('/') + '/'.join(url_list)