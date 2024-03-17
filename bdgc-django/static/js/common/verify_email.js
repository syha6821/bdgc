
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


const email_input = document.getElementById("email-input");
const email_box = document.getElementsByClassName("email-box")[0];
const verify_button = document.getElementById("verify-button");
const loading_ring = document.getElementsByClassName("lds-ring")[0];

const edit_info_button  =document.getElementById("edit-info-button")
const edit_info_modal = document.getElementsByClassName("edit-info-modal")[0]


email_input.addEventListener('focus',function(){
    email_box.style.marginBottom="50px";
})

email_input.addEventListener('focusout',function(){
    email_box.style.marginBottom="250px";
})

email_input.addEventListener('input',function(){
    if(email_input.value.length >= 4){
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

    EmailDuplicateCheck()

})

function EmailDuplicateCheck() {//파라미터 e빼둠
    
    var user_input_email = document.getElementById("email-input").value;
    var csrftoken = getCookie('csrftoken');

  
    document.querySelector("h2").style.color="#3684f1"
    document.querySelector("h2").innerText = "인증 링크를 전송 중 입니다"

    const request = new Request(
        'email_duplicate_check/',
        {
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-type': "text/plain; charset=utf-8"
            }
        },
    );

    fetch(request, {

        method: "POST",
        mode: 'same-origin',
        body: user_input_email // 중복 검사할 id 데이터

    }).then(response => response.json()).then(result=>{
        if (result.success == true){

              // 로딩바 출력
            document.getElementsByClassName("input-box")[0].classList.add("hidden")
            document.getElementsByClassName("email-span")[0].classList.add("hidden")
            loading_ring.classList.remove("hidden") 

            emailSubmitButtonClick()
 
        }
        else{
            document.querySelector("h2").style.color="red"
            document.querySelector("h2").innerText = "이미 등록된 이메일 입니다"
            verify_button.classList.add("blue-button-disable")
            verify_button.classList.remove("blue-button")

            // 여기 로딩바 돌아가는데, 

            // document.getElementsByClassName("input-box")[0].classList.remove("hidden")
            // document.getElementsByClassName("email-span")[0].classList.remove("hidden")
            // loading_ring.classList.add("hidden") // 로딩바 출력

        }
    });
}

function emailSubmitButtonClick(){
    // 이메일로 인증코드 전송
    var user_input_email = document.getElementById("email-input").value;
    
    verify_button.disabled = true;
    verify_button.classList.add("blue-button-disable")
    verify_button.classList.remove("blue-button")


    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        'email_submit/',
        {
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-type': "text/plain; charset=utf-8"
            }
        },
    );

    fetch(request, {

        method: "POST",
        mode: 'same-origin',
        body: user_input_email 

    }).then(response => response.json()).then(result=>{
        if (result.success == true){

            document.querySelector("h2").style.color="#3684f1"
            document.querySelector("h2").innerText = "학교 웹메일로 이동합니다"
            
            document.getElementsByClassName("input-box")[0].classList.add("hidden")
            document.getElementsByClassName("email-span")[0].classList.add("hidden")
            
            setTimeout(function(){
                location.href='https://mail.kumoh.ac.kr/mobile/account/login.m'
            },2000);       
            
        }
        else{

            document.querySelector("h2").style.color="red"
            document.querySelector("h2").innerText = result.message

            // 로딩바 숨김
            document.getElementsByClassName("input-box")[0].classList.remove("hidden")
            document.getElementsByClassName("email-span")[0].classList.remove("hidden")
            loading_ring.classList.add("hidden") 

            // 버튼 활성화
            verify_button.disabled = false;
            verify_button.classList.remove("blue-button-disable")
            verify_button.classList.add("blue-button")
        }
    });

}

function edit_info_modal_close(){
    edit_info_modal.style.display = "none"
}