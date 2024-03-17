const before_start = document.getElementById("before-start");

const first_page = document.getElementById("first-page");
const first_page_button = document.getElementById("first-page-button");
const first_page_button2 = document.getElementById("first-page-button-2");
const phone_number = document.getElementsByClassName("phone-number")
const phone_number_explain_span = document.getElementsByClassName("phone-number-explain-span")[0]
const first_page_name_of_input_box = document.querySelectorAll("#first-page .name-of-input-box")[0]
const phone_number_input_box = document.getElementById("phone-number-input-box")
const validation_code_input_box = document.getElementById("validation-code-input-box")
const validation_code = document.getElementById("validation-code")

const second_page = document.getElementById("second-page")
const location_select_button = document.getElementsByClassName("location-select-button")

const third_page = document.getElementById("third-page")
const user_id_input = document.getElementById("user-id-input")
const user_id_explain_span = document.getElementById("id-explain-span")
const nickname_input = document.getElementById("nickname-input")
const nickname_explain_span = document.getElementById("nickname-explain-span")
const password_input = document.getElementById("password-input")
const password_explain_span = document.getElementById("password-explain-span")
const password_check_input = document.getElementById("password-check-input")
const password_check_explain_span = document.getElementById("password-check-explain-span")

const last_page = document.getElementById("last-page")

const last_page_name_of_page = document.querySelectorAll("#last-page .name-of-page")[0]
const last_page_loading_ring = document.querySelector("#last-page #ring-parent")
const last_page_button = document.querySelectorAll("#last-page .button")[0]
const error_icon = document.getElementById("error-icon")
const success_icon = document.getElementById("success-icon")

let user_id_valid = false
let nickname_valid = true
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

setTimeout(function () {
    document.getElementById("percentage").style.width = "40%";
    before_start.classList.add("hidden")
    first_page.classList.remove("hidden")
    phone_number[0].focus();
}, 1500);

first_page_button2.addEventListener('click', function () {
    //인증코드 확인
    checkAuthCode()
})

function checkAuthCode(){

    var input_auth_code = document.getElementById("validation-code").value;

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        'check_auth_code',
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
        body: input_auth_code 

    }).then(response => response.json()).then(result => {
        if (result.success == true) {

            first_page.classList.add("hidden")
            second_page.classList.remove("hidden")
            document.getElementById("percentage").style.width = "60%";

        }
        else {
            phone_number_explain_span.style.color = "red"
            phone_number_explain_span.textContent = "코드가 일치하지 않습니다"
        }
    });

}

function phone_number_auto_next_tab(e) {
    if (e.target == phone_number[0]) {
        if (phone_number[0].value.length == 3) {
            phone_number[1].focus();
        }
        else {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
    if (e.target == phone_number[1]) {
        if (phone_number[1].value.length == 4) {
            phone_number[2].focus();
        }
        else {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
    if (e.target == phone_number[2]) {
        if (phone_number[2].value.length == 4 && phone_number[1].value.length == 4 && phone_number[0].value.length == 3) {
            
            first_page_button.classList.add("blue-button")
            first_page_button.classList.remove("blue-button-disable")
            first_page_button.disabled = false;
            e.target.blur();
        }
        else {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
}

function phone_number_valid(e) {
    if (e.target == phone_number[0]) {
        if (phone_number[0].value.length != 3) {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
    if (e.target == phone_number[1]) {
        if (phone_number[1].value.length != 4) {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
    if (e.target == phone_number[2]) {
        if (phone_number[2].value.length != 4) {
            first_page_button.classList.remove("blue-button")
            first_page_button.classList.add("blue-button-disable")
            first_page_button.disabled = true;
        }
    }
    if (phone_number[0].value.length == 3 && phone_number[1].value.length == 4 && phone_number[2].value.length == 4) {
        first_page_button.classList.add("blue-button")
        first_page_button.classList.remove("blue-button-disable")
        first_page_button.disabled = false;
    }
}

first_page_button.addEventListener('click', function () {
    // 카카오 알림톡으로 인증번호 발송
    sendAuthCodeKakaoApi()
})

function sendAuthCodeKakaoApi(){

    var input_phone_num = document.getElementById("phone-number-input-1").value + document.getElementById("phone-number-input-2").value + document.getElementById("phone-number-input-3").value

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        'send_auth_code_kakaoApi',
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
        body: input_phone_num 

    }).then(response => response.json()).then(result => {
        if (result.success == true) {

            phone_number_explain_span.style.color = "#3684f1"
            phone_number_explain_span.style.fontWeight = "500"
            phone_number_explain_span.textContent = "인증코드를 입력해 주세요"
            first_page_name_of_input_box.textContent = "인증코드"
            phone_number_input_box.classList.add("hidden")
            validation_code_input_box.classList.remove("hidden")
            first_page_button.classList.add("hidden")
            first_page_button2.classList.remove("hidden")
            validation_code.focus();

        }
        else {
            alert(result.message)
        }
    });

}

function validation_code_fiiled() {
    if (validation_code.value.length == 4) {
        first_page_button2.classList.remove("blue-button-disable")
        first_page_button2.classList.add("blue-button")
        first_page_button2.disabled = false
        validation_code.blur();
    }
}

let selected_location;

function location_selected(e) {
    e.target.style.color = "white"
    e.target.style.backgroundColor = "#3684f1"
    e.target.style.borderColor = "#3684f1"

    selected_location = e.target.textContent;

    for (let button of location_select_button) {
        button.disabled = true
    }

    setTimeout(function () {
        document.getElementById("percentage").style.width = "80%";
        second_page.classList.add("hidden")
        third_page.classList.remove("hidden")
    }, 1200);
}

user_id_input.addEventListener('focusout', id_validate_check)
user_id_input.addEventListener('focusout', input_is_all_filled)

function show_id_expalin_span() {
    user_id_explain_span.textContent = "4글자 이상 영문자 / 숫자 포함 가능";
    user_id_explain_span.style.color = "gray";
    user_id_valid = false
    input_is_all_filled()
}

function id_validate_check(e) {
    var regExp_id = /^[a-z]+[a-z0-9]{3,12}$/g;

    if (regExp_id.test(e.target.value)) {
        //중복검사
        IdDuplicateCheck()

    }
    else if (!regExp_id.test(e.target.value)) {
        user_id_explain_span.textContent = "조건에 맞지 않음";
        user_id_explain_span.style.color = "red";
        user_id_input.addEventListener('focus', show_id_expalin_span)
        user_id_valid = false
    }
}


function IdDuplicateCheck() {//파라미터 e빼둠
    //정규식 검사
    //var regExp_id = /^[a-z]+[a-z0-9]{5,19}$/g;
    var user_input_id = user_id_input.value;

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        '../../../signup/id_duplicate_check/',
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
        body: user_input_id // 중복 검사할 id 데이터

    }).then(response => response.json()).then(result => {
        if (result.success == true) {

            user_id_input.addEventListener('focus', show_id_expalin_span)
            user_id_valid = true

            user_id_explain_span.textContent = "사용가능한 아이디 입니다";
            user_id_explain_span.style.color = "#3684f1";

            input_is_all_filled()
        }
        else {
            //중복 발생
            user_id_explain_span.textContent = "이미 존재하는 아이디 입니다";
            user_id_explain_span.style.color = "red";
            user_id_input.addEventListener('focus', show_id_expalin_span)
            user_id_valid = false

        }
    });
}


nickname_input.addEventListener('focusout', nickname_validate_check)
nickname_input.addEventListener('focusout', input_is_all_filled)


function show_nickname_expalin_span() {
    nickname_explain_span.textContent = "2글자 이상 한글, 영문자, 숫자 ( 중복가능 )";
    nickname_explain_span.style.color = "gray";
    nickname_valid = false
    input_is_all_filled()
}

function nickname_validate_check(e) {
    var regExp_id = /^[가-힣a-z0-9]{2,12}$/g;

    if (regExp_id.test(e.target.value)) {
        nickname_explain_span.textContent = "사용가능한 닉네임 입니다";
        nickname_explain_span.style.color = "#3684f1";
        nickname_input.addEventListener('focus', show_nickname_expalin_span)
        nickname_valid = true
        input_is_all_filled()
    }
    else if (!regExp_id.test(e.target.value)) {
        nickname_explain_span.textContent = "조건에 맞지 않음";
        nickname_explain_span.style.color = "red";

        nickname_input.addEventListener('focus', show_nickname_expalin_span)
        nickname_valid = false
    }
}

password_input.addEventListener('input', reset_password_check_input)
password_input.addEventListener('focusout', password_validate_check)
password_input.addEventListener('focusout', input_is_all_filled)

function reset_password_check_input() {
    password_check_input.value = ""
    password_check_explain_span.textContent = ""
}

function show_password_expalin_span() {
    password_explain_span.textContent = "6글자 이상 영소,대문자 / 숫자, 특수문자 포함 가능";
    password_explain_span.style.color = "gray";
    password_valid = false;
    input_is_all_filled()
}

function password_validate_check(e) {
    var regExp_id = /^[!?@#$%^&*():;+-=A-Za-z0-9]{5,12}$/g;

    if (regExp_id.test(e.target.value)) {
        password_explain_span.textContent = "사용가능한 비밀번호 입니다";
        password_explain_span.style.color = "#3684f1";
        password_input.addEventListener('focus', show_password_expalin_span)
        password_valid = true;
        input_is_all_filled()
    }
    else if (!regExp_id.test(e.target.value)) {
        password_explain_span.textContent = "조건에 맞지 않음";
        password_explain_span.style.color = "red";

        password_input.addEventListener('focus', show_password_expalin_span)
        password_valid = false;
    }
}

password_check_input.addEventListener('input', password_check_validate_check)
password_check_input.addEventListener('focusout', password_check_validate_check)
password_check_input.addEventListener('focusout', input_is_all_filled)


function show_password_check_expalin_span() {
    password_check_explain_span.textContent = "";
    password_check_valid = false
    input_is_all_filled()
}


function password_check_validate_check(e) {
    if (password_check_input.value.length >= password_input.value.length) {
        if (password_check_input.value == password_input.value) {
            password_check_explain_span.textContent = "비밀번호가 일치합니다";
            password_check_explain_span.style.color = "#3684f1";
            password_check_input.addEventListener('focus', show_password_check_expalin_span)
            password_check_valid = true
            input_is_all_filled()
        }
        else {
            password_check_explain_span.textContent = "비밀번호가 일치하지 않습니다";
            password_check_explain_span.style.color = "red";

            password_check_input.addEventListener('focus', show_password_check_expalin_span)
            password_check_valid = false
        }
    }
    else if (password_check_input.value.length < password_input.value.length) {
        password_check_explain_span.textContent = "";
        password_check_valid = false
    }

}

const complete_sign_up_button = document.getElementById("third-page-button");

function input_is_all_filled() {
    all_inputs = document.querySelectorAll("input")
    for (let signup_input of all_inputs) {
        if (signup_input.value == "")
            return false
    }

    if (user_id_valid && nickname_valid && password_valid && password_check_valid) {
        complete_sign_up_button.classList.add("blue-button")
        complete_sign_up_button.classList.remove("blue-button-disable")
        complete_sign_up_button.disabled = false
        return true
    }
    else {
        complete_sign_up_button.classList.remove("blue-button")
        complete_sign_up_button.classList.add("blue-button-disable")
        complete_sign_up_button.disabled = true
        return false
    }
}

function send_sign_up_json() {
    all_inputs = document.querySelectorAll("input")
    for (let signup_input of all_inputs) {
        signup_input.blur();
    }
    if (input_is_all_filled()) {
        // 회원가입 진행

        let json_data = {
            input_phone_num: document.getElementById("phone-number-input-1").value + document.getElementById("phone-number-input-2").value + document.getElementById("phone-number-input-3").value,
            input_place: selected_location,
            input_id: user_id_input.value,
            input_nick_name: nickname_input.value,
            input_password: password_input.value
        }

        // 로딩바 출력
        document.getElementById("percentage").style.width = "100%";
        third_page.classList.add("hidden")
        last_page.classList.remove("hidden")

        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            '',
            {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-type': 'application/json'
                }
            },
        );
        fetch(request, {

            method: "POST",
            mode: 'same-origin',
            body: JSON.stringify(json_data),

        }).then(response => response.json()).then(result => {
            if (result.success == true) {

                last_page_name_of_page.textContent = "회원가입이 완료되었습니다"
                last_page_loading_ring.classList.add("hidden")
                last_page_button.classList.remove("hidden")
                success_icon.classList.remove("hidden")

            }
            else {
                last_page_name_of_page.textContent = result.message
                last_page_loading_ring.classList.add("hidden")
                error_icon.classList.remove("hidden")
            }
        });

    }
}

complete_sign_up_button.addEventListener('click', send_sign_up_json)

