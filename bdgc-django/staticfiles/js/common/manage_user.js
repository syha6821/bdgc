function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


const formSwitches = document.getElementsByClassName("form-check-input");
const formSwitchesArray = Array.from(formSwitches);
// const userSearchButton = document.getElementById("user_search_button");

formSwitchesArray.map(element => element.addEventListener('click',
    function (event) {

        const input_user = event.target.value
        const input_checked = event.target.checked

        let data = {
            input_user : input_user,
            input_checked : input_checked
        }

        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            'user/ban_request',
            {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-type': "application/json; charset=utf-8"
                }
            },
        );
        fetch(request, {
            method: "POST",
            mode: 'same-origin',
            body: JSON.stringify(data),
        }).then(response => response.json()).then(result => {
            if (result.success == true) {

                setTimeout(() => {
                    alert(result.message)
                }, 10);
            }
            else {
                alert(result.message)
            }
        });

    }
))



const page_elements = document.getElementsByClassName("page-link");
Array.from(page_elements).forEach(function(element) {
    element.addEventListener('click', function() {
        document.getElementById('page').value = this.dataset.page;
        document.getElementById('searchForm').submit();
    });
});

const btn_search = document.getElementById("btn_search");
btn_search.addEventListener('click', function() {
    document.getElementById('user_id').value = document.getElementById('search_user_id').value;
    document.getElementById('page').value = 1;  // 검색버튼을 클릭할 경우 1페이지부터 조회한다.
    document.getElementById('searchForm').submit();
});