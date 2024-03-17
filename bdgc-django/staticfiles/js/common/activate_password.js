
// csrf 토큰 
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

const password_input = document.getElementById("input_password");
const verify_button = document.getElementById("verify-button");
const loading_ring = document.getElementsByClassName("lds-ring")[0];



password_input.addEventListener('input',function(){
    if(password_input.value.length >= 4){
        verify_button.disabled = false;
        verify_button.classList.remove("blue-button-disable")
        verify_button.classList.add("blue-button")
    }
    else{
        verify_button.disabled = true;
        verify_button.classList.add("blue-button-disable")
        verify_button.classList.remove("blue-button")
    }
})

verify_button.addEventListener('click',function(){
    changePasswordButtonClick()
})

function changePasswordButtonClick()
{
    const input_password = document.getElementById('input_password').value;
    const input_re_password = document.getElementById('input_re_password').value;

    document.querySelector("h2").style.color="#3684f1"
    document.querySelector("h2").innerText = "비밀번호 변경 중"


    // 로딩바 출력 및 입력창 숨김
    document.getElementsByClassName("user-password-box")[0].style.display='none'
    document.getElementsByClassName("user-password-box")[1].style.display='none'
    loading_ring.classList.remove("hidden")

    //버튼 못누르게 막음
    verify_button.classList.add("blue-button-disable")
    verify_button.classList.remove("blue-button")
    verify_button.disabled= true;

    let data = {   
        input_password : input_password,
        input_re_password : input_re_password,
    }

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        '',
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
    }).then(response => response.json()).then(result=>{
        if (result.success == true){

            document.querySelector("h2").style.color="#3684f1"
            document.querySelector("h2").innerText = "비밀번호 변경 완료"
            
            loading_ring.classList.add("hidden") 
            // verify_button.classList.add("blue-button-disable")
            // verify_button.classList.remove("blue-button")
            // verify_button.disabled= true;
            
        }
        else{

            document.querySelector("h2").style.color="red"
            document.querySelector("h2").innerText = result.message

            document.getElementsByClassName("user-password-box")[0].style.display='flex'
            document.getElementsByClassName("user-password-box")[1].style.display='flex'

            loading_ring.classList.add("hidden")

            verify_button.classList.remove("blue-button-disable")
            verify_button.classList.add("blue-button")
            verify_button.disabled= false;
        }
    });
}

