const minimum_money = document.getElementById("minimum-money")
const current_money = document.getElementById("current-money")
const join_info_box = document.getElementById("join-info-box")
const join_button = document.getElementById("join-button")
const fifth_page = document.getElementById("fifth-page")
const nineth_page = document.getElementById("nineth-page")
const join_info_area = document.getElementsByClassName("join-info-area")[0]

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


//메뉴추가
const add_button = document.getElementsByClassName('add-button')[0];

function delete_menu(e){
    e.target.parentElement.parentElement.classList.add("delete-menu-animation");
    setTimeout(function(){
        e.target.parentElement.parentElement.remove();
        input_is_all_filled()
    },300)
}

add_button.addEventListener('click',add_menu);

function add_menu(e){
    const menu_receipt_length = document.getElementsByClassName('menu-receipt').length;
    const menu_receipt = document.getElementsByClassName('menu-receipt')[menu_receipt_length-1];
    const added_menu = `
    <div class="menu-receipt">
            <div class="added-menu-head">
                <span class="added-menu-span">추가메뉴</span>
                <img id="delete-menu-icon" onclick="delete_menu(event)" src="../../static/image/delete_icon.png">
            </div>
            <div class="menu-receipt-menu">
                <span class="name-of-input-box">메뉴명</span>
                <div class="input-box receipt-box" id="menu-box" >
                    <input type="text" class="menu-name" oninput="input_is_all_filled()" placeholder="위 음식점의 메뉴를 입력해 주세요" spellcheck="false" autofocus>
                </div>
            </div>
            <div class="menu-receipt-price">
                <span class="name-of-input-box">가격</span>
                <div class="input-box receipt-box" id="price-box">
                    <input type="text" class="menu-prices" oninput="input_is_all_filled();" onclick="move_cursor_before_won(event)"onkeyup="number_comma(event)" pattern="[0-9]*" min="0" id="price-box" placeholder="입력하신 메뉴의 가격을 입력해 주세요" spellcheck="false">
                </div>
            </div>
            <div class="menu-receipt-number">                
                <span class="menu-number-span name-of-input-box">수량</span>

                <div class="input-box receipt-box number-box-parent">
                    <div class="input-box receipt-box" id="number-box">
                        <img class="number-button" id="menu-minus-button" onclick="minus_menu_number(event);input_is_all_filled();" src="../../static/image/minus_icon.png">
                        <input type="number" name="menu-number" pattern="[0-9]*" min="1" class="menu-numbers" oninput="getWholePrice()" id="menu-number-input" value="1" spellcheck="false" readonly>
                        <img class="number-button" id="menu-plus-button" onclick="plus_menu_number(event);input_is_all_filled();" src="../../static/image/plus_icon.png">
                    </div>
                </div>
            </div>
        </div>
`
    menu_receipt.insertAdjacentHTML('afterend',added_menu);
    input_is_all_filled()
    window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}
//수량 더하고 빼기
function minus_menu_number(e){
    if(e.target.parentElement.children[1].value>1){
        e.target.parentElement.children[1].value--;
    }
}

function minus_menu_number_person(e){
    if(e.target.parentElement.children[1].value>2){
        e.target.parentElement.children[1].value--;
    }
}

function plus_menu_number(e){
    e.target.parentElement.children[1].value++;
}
//파티장의 총 주문금액
function getWholePrice(){
    const menus = document.getElementsByClassName('menu-receipt');
    const menu_prices = document.getElementsByClassName('menu-prices');
    const menu_numbers = document.getElementsByClassName('menu-numbers');
    const my_price = document.getElementById('my-price');

    let whole_price = 0;
    
    for (let i = 0; i < menus.length; i++){
        menu_price = parseInt(menu_prices[i].value.replace(",",""))
        whole_price = whole_price + (menu_numbers[i].value*menu_price);
    }

    if(isNaN(whole_price)) {
        whole_price = "0";
    }
    else{
        whole_price = whole_price.toLocaleString('ko-KR')
    }
    my_price.innerHTML = whole_price;
}
//숫자에 단위 콤마 찍기 (메뉴 가격, 목표 금액, 매장 배달비)
function move_cursor_before_won(e){
    e.target.setSelectionRange(e.target.value.length-2, e.target.value.length-2);
}

function number_comma(e){
    origin_value = parseInt(e.target.value.replace(/\,|원|\s/g,""))
    if(isNaN(origin_value)) {
        e.target.value = "";
    }
    else{
        e.target.value = origin_value.toLocaleString('ko-KR') + " 원"
        e.target.setSelectionRange(e.target.value.length-2, e.target.value.length-2);
    }
}

//메뉴명, 가격 모두 입력했는지 확인

function input_is_all_filled(){
    inputs = document.querySelectorAll("#fifth-page input");
    for (input_in_fifth_page of inputs){
        if(input_in_fifth_page.value == ""){
            join_info_box.style.backgroundColor = "#c1d3ee"
            join_button.style.backgroundColor = "#c1d3ee"
            join_button.disabled = true
            return false
        }
    }
    join_info_box.style.backgroundColor = "#3ea6ff"
    join_button.style.backgroundColor = "#3ea6ff"
    join_button.disabled = false
    if(!getWholePrice()){
        join_info_box.style.backgroundColor = "#c1d3ee"
        join_button.style.backgroundColor = "#c1d3ee"
        join_button.disabled = true
        return false
    }
    return true
}

function getWholePrice(){
    const menus = document.getElementsByClassName('menu-receipt');
    const menu_prices = document.getElementsByClassName('menu-prices');
    const menu_numbers = document.getElementsByClassName('menu-numbers');

    let whole_price = 0;
    
    for (let i = 0; i < menus.length; i++){
        menu_price = parseInt(menu_prices[i].value.replace(",",""))
        whole_price = whole_price + (menu_numbers[i].value*menu_price);
    }

    if(isNaN(whole_price)) {
        whole_price = "0";
    }
    current_money.textContent = whole_price
    if(whole_price >= minimum_money.innerText){
        join_info_box.style.backgroundColor = "#3ea6ff"
        join_button.style.backgroundColor = "#3ea6ff"
        join_button.disabled = false
        
        return true
    }
    return false
    // my_price.innerHTML = whole_price;
}

function get_final_receipt(){
    let receipt_array =[];

    const menus = document.getElementsByClassName('menu-receipt');
    const menu_name = document.getElementsByClassName('menu-name');
    const menu_prices = document.getElementsByClassName('menu-prices');
    const menu_numbers = document.getElementsByClassName('menu-numbers');
    
    for (let i = 0; i < menus.length; i++){
        let menu_array = [];
        menu_array[0] = menu_name[i].value;
        menu_array[1] = parseInt(menu_prices[i].value.replace(",",""));
        menu_array[2] = parseInt(menu_numbers[i].value);

        receipt_array[i] = menu_array;
    }

    return receipt_array;
}


join_button.addEventListener('click', function () {
    fifth_page.classList.add("hidden");
    join_info_area.style.display = "none"
    nineth_page.classList.remove("hidden");

    let csrftoken = getCookie('csrftoken');

    fetch("", {
        method: "POST",
        headers: {
            'X-CSRFToken': csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(make_json()),
    })
        .then((response) => {
            
            return response.json()
            })
        .then((response_json) => {
            let message = response_json.message
            if (response_json.success == true) {
                let share_url = response_json.share_url
                setTimeout(function(){
                    document.querySelectorAll("#nineth-page .loading-ring-parent")[0].classList.add("hidden")
                    document.getElementById("share-link").innerText = share_url
                    document.querySelectorAll("#nineth-page .name-of-page")[0].textContent = message
                    document.querySelectorAll("#nineth-page .share-link-box")[0].classList.remove("hidden")    
                }, 2000);
            }
            else if (response_json.success == false) {
                setTimeout(function(){
                    document.querySelectorAll("#nineth-page .loading-ring-parent")[0].classList.add("hidden")
                    document.querySelectorAll("#nineth-page .name-of-page")[0].textContent = "파티에 참가하지 못했습니다"
                    document.getElementById("error-message").textContent = message
                    document.querySelectorAll("#nineth-page .fail-box")[0].classList.remove("hidden")
                }, 2000);
            }
        })
        .catch((error) => {
            setTimeout(function(){
                document.querySelectorAll("#nineth-page .loading-ring-parent")[0].classList.add("hidden")
                document.querySelectorAll("#nineth-page .name-of-page")[0].textContent = "파티에 참가하지 못했습니다"
                document.getElementById("error-message").textContent = message
                document.querySelectorAll("#nineth-page .fail-box")[0].classList.remove("hidden")
            }, 2000);
        });
})

function make_json() {
    receipt_final = get_final_receipt();

    let json_data = {
       receipt: receipt_final,
       personal_request : ''
    }

    return json_data
}



var copyText = document.getElementById("share-link");

async function copyClipboard() {
    
    try {
        await navigator.clipboard.writeText(copyText.innerText);
        alert("클립보드에 공유 링크가 복사되었습니다");
    } catch (err) {
        alert(err)
    }
}