
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

const email_input = document.getElementById("input_email");
const id_input = document.getElementById("input_id");
const email_box = document.getElementsByClassName("email-box")[0];
const verify_button = document.getElementById("verify-button");
const loading_ring = document.getElementsByClassName("lds-ring")[0];


// email_input.addEventListener('focus',function(){
//     email_box.style.marginBottom="50px";
// })

// email_input.addEventListener('focusout',function(){
//     email_box.style.marginBottom="250px";
// })

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
    changePasswordButtonClick()
})

function changePasswordButtonClick()
{
    const input_email = document.getElementById('input_email').value;
    const input_id = document.getElementById('input_id').value;

    document.querySelector("h2").style.color="#3684f1"
    document.querySelector("h2").innerText = "메일을 전송 중 입니다"


    // 로딩바 출력 및 입력창 숨김
    document.getElementsByClassName("input-box")[0].classList.add("hidden")
    document.getElementsByClassName("input-box")[1].classList.add("hidden")
    document.getElementsByClassName("email-span")[0].classList.add("hidden")
    document.getElementsByClassName("email-span")[1].classList.add("hidden")

    loading_ring.classList.remove("hidden")

    //버튼 못누르게 막음
    verify_button.classList.add("blue-button-disable")
    verify_button.classList.remove("blue-button")
    verify_button.disabled= true;

    let data = {   
        input_email : input_email,
        input_id : input_id,
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
            document.querySelector("h2").innerText = "메일을 전송했습니다."
            
            loading_ring.classList.add("hidden") 
            // verify_button.classList.add("blue-button-disable")
            // verify_button.classList.remove("blue-button")
            // verify_button.disabled= true;
            
        }
        else{

            document.querySelector("h2").style.color="red"
            document.querySelector("h2").innerText = result.message

            document.getElementsByClassName("input-box")[0].classList.remove("hidden")
            document.getElementsByClassName("input-box")[1].classList.remove("hidden")
            document.getElementsByClassName("email-span")[0].classList.remove("hidden")
            document.getElementsByClassName("email-span")[1].classList.remove("hidden")
            

            loading_ring.classList.add("hidden")

            verify_button.classList.remove("blue-button-disable")
            verify_button.classList.add("blue-button")
            verify_button.disabled= false;
        }
    });
}

