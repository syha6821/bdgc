const open_footer_button = document.getElementById("open-footer-button")
const footer_info = document.getElementById("footer-info")
const edit_info_button  =document.getElementById("edit-info-button")
const edit_info_modal = document.getElementsByClassName("edit-info-modal")[0]

const nickname_input = document.getElementById("nickname-input")
const nickname_explain_span = document.getElementById("nickname-explain-span")
const current_password_input = document.getElementById("current-password-input")
const current_password_explain_span = document.getElementById("current-password-explain-span")
const password_input = document.getElementById("password-input")
const password_explain_span = document.getElementById("password-explain-span")
const password_check_input = document.getElementById("password-check-input")
const password_check_explain_span = document.getElementById("password-check-explain-span")

const select_box = document.getElementsByClassName("select-box")[0];


const nickname_info_button = document.querySelectorAll(".info-edit-select-box button")[0]
const password_info_button = document.querySelectorAll(".info-edit-select-box button")[1]

const info_nickname_edit_box = document.getElementsByClassName("info-nickname-edit-box")[0]
const info_password_edit_box = document.getElementsByClassName("info-password-edit-box")[0]

const info_edit_select_box = document.getElementsByClassName("info-edit-select-box")[0]

const modal_save_button = document.getElementById("modal-save-button")

const nickname = document.getElementById("nickname")

const extra_button = document.getElementById("extra-button")
const extra_info_modal = document.getElementsByClassName("extra-info-modal")[0]
const extra_info_content_box = document.getElementById("extra-info-content-box")
const close_extra_info_modal_button = document.getElementById("close-extra-info-modal-button")

const withdraw = document.getElementById("withdraw")
const slider_checkbox = document.getElementById("slider-checkbox")


let nickname_valid = false
let current_password_valid = false
let password_valid = false
let password_check_valid = false


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


// // 뒤로가기 포함 페이지 요청시.
// window.onpageshow = function (event) { 
//     if (event.persisted) 
//      { 
//         window.location.reload();
//     
// }


function first_loading(){
    // fetch 써서 
    const request = new Request(
        'check_myinfo',
        {
            headers: {
                'Content-type': "application/json; charset=utf-8"
            }
        },
    );
    fetch(request, {
        method: "GET",
        mode: 'same-origin',
    }).then(response => response.json()).then(result=>{
        if (result.success == true){

            nickname.textContent = result.nick_name;

            if (result.alim == true)
            {
                slider_checkbox.checked = true;
            }
            else if (result.alim == false)
            {
                slider_checkbox.checked = false;
            }
            
            
            if (result.place == "학교 내부")
            {
                select_box.selectedIndex = 0;
            }
            else if (result.place == "학교 앞 원룸")
            {
                select_box.selectedIndex = 1;
            }
            else if (result.place == "옥계")
            {
                select_box.selectedIndex = 2;
            }
            
        }
        else{
            alert(result.message)
            
        }
    });
}



open_footer_button.addEventListener("click",function(){
    if(open_footer_button.classList.contains("open")){
        open_footer_button.classList.toggle("open")
        footer_info.style.height = "60px"
        setTimeout(() => {
            open_footer_button.innerText = "⌄"
            }, 200);
    }
    else{
        open_footer_button.classList.toggle("open")
        footer_info.style.height = "0"
        setTimeout(() => {
            open_footer_button.innerText = "사이트 정보 확인"
            }, 200);
    }
})

edit_info_button.addEventListener('click',function(){
    edit_info_modal.style.display = "block"
    info_edit_select_box.style.display = 'flex'
    info_nickname_edit_box.classList.add('hidden')
    info_password_edit_box.classList.add('hidden')
    modal_save_button.style.backgroundColor = "#c1d3ee"
    modal_save_button.disabled = true
})


function edit_info_modal_close(){
    info_edit_input_all_reset()
    edit_info_modal.style.display = "none"
    modal_save_button.style.display = "none"
    modal_save_button.style.backgroundColor = "#c1d3ee"
    modal_save_button.disabled = true
  }


  nickname_input.addEventListener('focusout',nickname_validate_check)


function show_nickname_expalin_span(){
    nickname_explain_span.textContent="2글자 이상 한글, 영문자, 숫자 ( 중복가능 )";
    nickname_explain_span.style.color="gray";
    nickname_valid = false
}

function nickname_validate_check(e){
    var regExp_id =  /^[가-힣a-z0-9]{2,12}$/g;

    if( regExp_id.test(e.target.value) )
    {
        nickname_explain_span.textContent="사용가능한 닉네임 입니다";
        nickname_explain_span.style.color="#3684f1";
        nickname_input.addEventListener('focus',show_nickname_expalin_span)
        modal_save_button.style.backgroundColor = "#3ea6ff"
        modal_save_button.disabled = false
        nickname_valid = true
    }
    else if(!regExp_id.test(e.target.value)){
        nickname_explain_span.textContent="조건에 맞지 않음";
        nickname_explain_span.style.color="red";
        nickname_input.addEventListener('focus',show_nickname_expalin_span)
        modal_save_button.style.backgroundColor = "#c1d3ee"
        modal_save_button.disabled = true
        nickname_valid = false
    }
}

current_password_input.addEventListener('focusout',current_password_check)

function current_password_check(e){

    const input_password = current_password_input.value;

    let data = {   
        input_password : input_password,
    }

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        'validate_password',
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
            current_password_explain_span.textContent="현재 사용중인 비밀번호와 일치합니다";
            current_password_explain_span.style.color="#3684f1";
            current_password_input.addEventListener('focus',function(){
            current_password_explain_span.textContent=""
        })
        current_password_valid = true;
        password_input_is_all_filled()
         
        }
        else{
            
            current_password_explain_span.textContent="입력한 비밀번호가 현재 사용중인 비밀번호와 다릅니다";
            current_password_explain_span.style.color="red";
            current_password_input.value = ""
            current_password_input.addEventListener('focus',function(){
            current_password_explain_span.textContent=""
        })
        current_password_valid = false;
        password_input_is_all_filled()
        }
    });
}

password_input.addEventListener('input',reset_password_check_input)
password_input.addEventListener('focusout',password_validate_check)

function reset_password_check_input(){
    password_check_input.value = ""    
    password_check_explain_span.textContent = ""
}

function show_password_expalin_span(){
    password_explain_span.textContent="6글자 이상 영소,대문자 / 숫자, 특수문자 포함 가능";
    password_explain_span.style.color="gray";
    password_valid = false;
}



function password_validate_check(e){
    var regExp_id = /^[!?@#$%^&*():;+-=A-Za-z0-9]{5,12}$/g;

    if( regExp_id.test(e.target.value) )
    {
        password_explain_span.textContent="사용가능한 비밀번호 입니다";
        password_explain_span.style.color="#3684f1";
        password_input.addEventListener('focus',show_password_expalin_span)
        password_valid = true;
        password_input_is_all_filled()
    }
    else if(!regExp_id.test(e.target.value)){
        password_explain_span.textContent="조건에 맞지 않음";
        password_explain_span.style.color="red";

        password_input.addEventListener('focus',show_password_expalin_span)
        password_valid = false;
        password_input_is_all_filled()
    }
}

password_check_input.addEventListener('input',password_check_validate_check)
password_check_input.addEventListener('focusout',password_check_validate_check)


function show_password_check_expalin_span(){
    password_check_explain_span.textContent="";
    password_check_valid = false
}


function password_check_validate_check(e){
    if(password_check_input.value.length >= password_input.value.length){
        if(password_check_input.value == password_input.value){
            password_check_explain_span.textContent="비밀번호가 일치합니다";
            password_check_explain_span.style.color="#3684f1";
            password_check_input.addEventListener('focus', show_password_check_expalin_span)
            password_check_valid = true
            password_input_is_all_filled()
        }
        else{
            password_check_explain_span.textContent="비밀번호가 일치하지 않습니다";
            password_check_explain_span.style.color="red";

            password_check_input.addEventListener('focus', show_password_check_expalin_span)
            password_check_valid = false
            password_input_is_all_filled()
        }
    }
    else if(password_check_input.value.length < password_input.value.length){
        password_check_explain_span.textContent="";
        password_check_valid = false
        password_input_is_all_filled()
    }
        
}

select_box.addEventListener("change", change_location);

function change_location(){
    const location = select_box.options[select_box.selectedIndex].value;

    let data = {   
        input_place : location,
    }

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        'modify_place',
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

            setTimeout(() => {
                alert(`내 위치가 변경되었습니다`)
                    }, 10);
        }
        else{
            alert(result.message)
        }
    });
}

nickname_info_button.addEventListener('click',function(){
    info_edit_select_box.style.display = "none"
    info_nickname_edit_box.classList.remove('hidden')
    modal_save_button.style.display = "block"
})

password_info_button.addEventListener('click',function(){
    info_edit_select_box.style.display = "none"
    info_password_edit_box.classList.remove('hidden')
    modal_save_button.style.display = "block"
})

function edit_info_modal_save(){

    if(current_password_valid && password_valid && password_check_valid){
        
        const input_now_password = current_password_input.value;
        const input_new_password = password_input.value ;
        const input_re_password = password_check_input.value;

        let data = {   
            input_now_password : input_now_password,
            input_new_password : input_new_password,
            input_re_password : input_re_password,
        }
    
        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            'modify_password',
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
                alert("변경사항이 저장되었습니다")
                info_edit_input_all_reset()
                edit_info_modal_close()
            }
            else{
                info_edit_input_all_reset()
                alert(result.message)
            }
        });
    }

    else if(nickname_valid){

        const input_nick_name = nickname_input.value;

        let data = {   
            input_nick_name : input_nick_name,
        }
    
        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            'modify_nick_name',
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
                alert("변경사항이 저장되었습니다")
                info_edit_input_all_reset()
                edit_info_modal_close()
                nickname.textContent = input_nick_name;
            }
            else{
                info_edit_input_all_reset()
                alert(result.message)
            }
        });
    }
}

function password_input_is_all_filled(){
    all_inputs = document.querySelectorAll(".info-password-edit-box input")
    for(var password_input of all_inputs){
        if(password_input.value == "")
        return false
    }

    if(current_password_valid && password_valid && password_check_valid){
        modal_save_button.style.backgroundColor = "#3ea6ff"
        modal_save_button.disabled = false
        return true
    }
    else{
        modal_save_button.style.backgroundColor = "#c1d3ee"
        modal_save_button.disabled = true
        return false
    }
}

function info_edit_input_all_reset(){
    all_inputs = document.querySelectorAll(".info-content-box input")
    for(let password_input of all_inputs){
        password_input.value = ""
    }
    nickname_explain_span.textContent="2글자 이상 한글, 영문자, 숫자 ( 중복가능 )";
    nickname_explain_span.style.color="gray"
    password_explain_span.textContent="6글자 이상 영소,대문자 / 숫자, 특수문자 포함 가능";
    password_explain_span.style.color="gray";
    password_check_explain_span.textContent="";
    modal_save_button.style.backgroundColor = "#c1d3ee"
    modal_save_button.disabled = true
}

extra_button.addEventListener('click',function(){
    extra_info_modal.style.display = "block"
})

close_extra_info_modal_button.addEventListener('click',function(){
    extra_info_modal.style.display = "none"
})



withdraw.addEventListener('click',function(){
    // 탈퇴 메시지.
    if (confirm ("정말로 탈퇴하시겠습니까? \n탈퇴한 계정정보는 2주 동안 보관됩니다.")){
     

        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            '../withdrawal/',
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

        }).then(response => response.json()).then(result=>{
            if (result.success == true){
                alert("변경사항이 저장되었습니다")
                location.replace('/')
            }
            else{
                alert(result.message)
            }
        });
    }

}) 


slider_checkbox.addEventListener('click',function(){

    const input_alim =  slider_checkbox.checked;

        let data = {   
            input_alim : input_alim,
        }
    
        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            'modify_Alim',
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
                
            }
            else{
                alert(result.message)
            }
        });
    }
)