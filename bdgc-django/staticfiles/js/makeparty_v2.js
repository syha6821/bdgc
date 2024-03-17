//csrf 토큰 생성
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


//다음 버튼
first_page = document.getElementById("first-page");
second_page = document.getElementById("second-page");
third_page = document.getElementById("third-page");
fourth_page = document.getElementById("fourth-page");
fifth_page = document.getElementById("fifth-page");
sixth_page = document.getElementById("sixth-page");
seventh_page = document.getElementById("seventh-page");
eighth_page = document.getElementById("eighth-page");
nineth_page = document.getElementById("nineth-page");

first_page_button = document.getElementById("first-page-button");
second_page_button = document.getElementById("second-page-button");
third_page_button = document.getElementById("third-page-button");
fourth_page_button = document.getElementById("fourth-page-button");
fifth_page_button = document.getElementById("fifth-page-button");
sixth_page_button = document.getElementById("sixth-page-button");
seventh_page_button = document.getElementById("seventh-page-button");
eighth_page_button = document.getElementById("eighth-page-button");



//첫페이지 버튼 (카카오톡 으로 이동)
first_page_button.addEventListener('click', function () {
    first_page.classList.add("hidden");
    first_page_button.classList.add("hidden");
    second_page.classList.remove("hidden");
    second_page_button.classList.remove("hidden");
})
//두번째페이지 버튼 (카카오톡 링크 입력)
second_page_button.addEventListener('click', function () {
    second_page.classList.add("hidden");
    second_page_button.classList.add("hidden");
    third_page.classList.remove("hidden");
    third_page_button.classList.remove("hidden");
})
//세번째페이지 버튼 (배달 앱 선택)
third_page_button.addEventListener('click', function () {
    third_page.classList.add("hidden");
    third_page_button.classList.add("hidden");
    fourth_page.classList.remove("hidden");
    fourth_page_button.classList.remove("hidden");
})
//네번째페이지 버튼 (매장 링크 입력)
fourth_page_button.addEventListener('click', function () {
    fourth_page.classList.add("hidden");
    fourth_page_button.classList.add("hidden");
    fifth_page.classList.remove("hidden");
    fifth_page_button.classList.remove("hidden");
})
//다섯번째페이지 버튼 (메뉴 입력)
fifth_page_button.addEventListener('click', function () {
    fifth_page.classList.add("hidden");
    fifth_page_button.classList.add("hidden");
    sixth_page.classList.remove("hidden");
    sixth_page_button.classList.remove("hidden");
    getWholePrice();
    document.getElementById("percentage").style.width = "70%";
})
//여섯번째페이지 버튼 (배달비, 인원 설정)
sixth_page_button.addEventListener('click', function () {
    sixth_page.classList.add("hidden");
    sixth_page_button.classList.add("hidden");
    seventh_page.classList.remove("hidden");
    seventh_page_button.classList.remove("hidden");
    make_map();
    document.getElementById("percentage").style.width = "80%";
})

//일곱번째페이지 버튼 (지도)
seventh_page_button.addEventListener('click', function () {
    seventh_page.classList.add("hidden");
    seventh_page_button.classList.add("hidden");
    eighth_page.classList.remove("hidden");
    eighth_page_button.classList.remove("hidden");
    make_map();
    document.getElementById("percentage").style.width = "90%";
})

//여덟번째페이지 버튼 (시간)
eighth_page_button.addEventListener('click', function () {
    eighth_page.classList.add("hidden");
    eighth_page_button.classList.add("hidden");
    nineth_page.classList.remove("hidden");
    document.getElementById("percentage").style.width = "100%";

    let csrftoken = getCookie('csrftoken');

    fetch("/party/create/", {
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
                    document.querySelectorAll("#nineth-page .name-of-page")[0].textContent = "파티를 생성하지 못했습니다"
                    document.getElementById("error-message").textContent = message
                    document.querySelectorAll("#nineth-page .fail-box")[0].classList.remove("hidden")
                }, 2000);
            }
        });
})


//이전 버튼

//

//카카오톡 링크
const kakao_link = document.getElementById('kakao-link');
const kakao_link_explain_span = document.getElementsByClassName('kakao-link-explain-span')[0];
const kakao_link_input_box = document.getElementById('kakao-link-input-box');

document.getElementsByClassName("delete-line-icon")[0].addEventListener('click', delete_kakao_input);

function delete_kakao_input(e) {
    kakao_link.value = "";
    kakao_link_explain_span.style.color = "gray";
    kakao_link_explain_span.textContent = "예시) 카카오톡 오픈채팅을 시작 ... https://open.kakao.com/example";
    kakao_link_explain_span.style.fontSize = "11px";
    // kakao_link_input_box.style.borderColor = "#dddfe2";
    document.getElementsByClassName("delete-line-icon")[0].classList.add("hidden");
    second_page_button.classList.add("blue-button-disable")
    second_page_button.classList.remove("blue-button")
}

kakao_link.addEventListener('input', kakao_link_valid);

function kakao_link_valid(e) {
    input_value = e.target.value;
    if (input_value.includes('open.kakao.com')) {
        kakao_link.blur();
        const loading_ling = document.getElementById("kakao-loading-ring");
        const second_page_before = document.getElementById("kakao-before")
        const second_page_after = document.getElementById("kakao-after")
        const kakao_result = document.getElementById("kakao-result");
        const kakao_page_head = document.querySelectorAll("#second-page .name-of-page")[0]

        openlink = input_value.split('https')[0];
        openlink_split_by_dot = openlink.split('\.');

        second_page_before.classList.add("hidden")
        second_page_after.classList.remove("hidden")
        kakao_page_head.innerHTML = "오픈채팅 링크를 확인 중 입니다"


        setTimeout(function () {
            loading_ling.classList.add("hidden")
            kakao_page_head.innerHTML = "오픈채팅 링크가 확인되었습니다"
            kakao_result.innerHTML = `${openlink_split_by_dot[openlink_split_by_dot.length - 1]} 오픈채팅 링크가 입력되었습니다`;
            second_page_button.classList.remove("blue-button-disable")
            second_page_button.classList.add("blue-button")
            second_page_button.disabled = false;
            document.getElementById("percentage").style.width = "40%";
        }, 1000)
    }
    else {
        kakao_link_explain_span.textContent = "올바르지 않은 링크입니다.";
        kakao_link_explain_span.style.color = "red";
        kakao_link_explain_span.style.fontSize = "12px";
        second_page_button.classList.add("blue-button-disable")
        second_page_button.classList.remove("blue-button")
        kakao_link.blur();
    }
    document.getElementsByClassName("delete-line-icon")[0].classList.remove("hidden");
}

//배달 앱 아코디언

const bm_icon = document.getElementsByClassName("bm-icon")[0];
const yogiyo_icon = document.getElementsByClassName("yogiyo-icon")[0];
const coupang_icon = document.getElementsByClassName("coupang-icon")[0];

const bm_icon_sad = document.getElementsByClassName("bm-icon-sad")[0];
const yogiyo_icon_sad = document.getElementsByClassName("yogiyo-icon-sad")[0];
const coupang_icon_sad = document.getElementsByClassName("coupang-icon-sad")[0];

bm_example_image = document.getElementById("bm-example");
yogiyo_example_image = document.getElementById("yogiyo-example");
coupang_example_image = document.getElementById("coupang-example");

bm_icon.addEventListener('click', show_example_image);
yogiyo_icon.addEventListener('click', show_example_image);
coupang_icon.addEventListener('click', show_example_image);

bm_icon_sad.addEventListener('click', show_example_image);
yogiyo_icon_sad.addEventListener('click', show_example_image);
coupang_icon_sad.addEventListener('click', show_example_image);

open_delivery_app = document.getElementById("open-delivery-app");

app_link_explain_span = document.getElementsByClassName("app-link-explain-span")[0];

function show_example_image(e) {
    if (e.target == bm_icon || e.target == bm_icon_sad) {
        bm_example_image.classList.remove("hidden");
        bm_icon.classList.remove("hidden");
        bm_icon_sad.classList.add("hidden");
        yogiyo_example_image.classList.add("hidden");
        yogiyo_icon.classList.add("hidden");
        yogiyo_icon_sad.classList.remove("hidden");
        coupang_example_image.classList.add("hidden");
        coupang_icon.classList.add("hidden");
        coupang_icon_sad.classList.remove("hidden");
        app_link_explain_span.textContent = "배달의민족 매장링크를 공유해 주세요";
        app_link_explain_span.style.color = "#2d7fea"
        app_link_explain_span.style.fontWeight = "500";
        open_delivery_app.setAttribute("href", "baemin://");
        store_link_explain_span.textContent = "예시) '한솥도시락' 어때요? 배달의민족 ... https://baemin.me/example";
    }
    else if (e.target == yogiyo_icon || e.target == yogiyo_icon_sad) {
        bm_example_image.classList.add("hidden");
        bm_icon.classList.add("hidden");
        bm_icon_sad.classList.remove("hidden");
        yogiyo_example_image.classList.remove("hidden");
        yogiyo_icon.classList.remove("hidden");
        yogiyo_icon_sad.classList.add("hidden");
        coupang_example_image.classList.add("hidden");
        coupang_icon.classList.add("hidden");
        coupang_icon_sad.classList.remove("hidden");
        app_link_explain_span.textContent = "요기요 매장링크를 공유해 주세요";
        app_link_explain_span.style.color = "#2d7fea"
        app_link_explain_span.style.fontWeight = "500";
        // open_delivery_app.setAttribute("href","yogiyoapp://");
        open_delivery_app.setAttribute("href", "https://yogiyo.onelink.me/BlI7?pid=bridge_page&c=&af_adset=&af_keywords=&label=&gclid=&af_dp=yogiyoapp%3A%2F%2Fopen%3F%26referrer%3D");
        store_link_explain_span.textContent = "예시) '한솥도시락' 요기요 앱 ... https://yogiyo.onelink.me/example";
    }
    else if (e.target == coupang_icon || e.target == coupang_icon_sad) {
        bm_example_image.classList.add("hidden");
        bm_icon.classList.add("hidden");
        bm_icon_sad.classList.remove("hidden");
        yogiyo_example_image.classList.add("hidden");
        yogiyo_icon.classList.add("hidden");
        yogiyo_icon_sad.classList.remove("hidden");
        coupang_example_image.classList.remove("hidden");
        coupang_icon.classList.remove("hidden");
        coupang_icon_sad.classList.add("hidden");
        app_link_explain_span.textContent = "쿠팡이츠 매장링크를 공유해 주세요";
        app_link_explain_span.style.color = "#2d7fea"
        app_link_explain_span.style.fontWeight = "500";
        open_delivery_app.setAttribute("href", "coupangeats://");
        store_link_explain_span.textContent = "예시) https://web.coupangeats.com/share?storeId=...";
    }
    third_page_button.classList.remove("blue-button-disable");
    third_page_button.classList.add("blue-button");
    third_page_button.disabled = false;
}

//가게명 trim & 올바른 입력 체크
const store_input = document.getElementById('store-link');
const store_result = document.getElementsByClassName('name-of-store-span')[0];
const store_link_explain_span = document.getElementsByClassName('store-link-explain-span')[0];
const store_link_input_box = document.getElementById('store-link-input-box');
const goto_name_of_store_span_a = document.getElementsByClassName('goto-name-of-store-span');

document.getElementsByClassName("delete-line-icon")[1].addEventListener('click', delete_store_input);

function delete_store_input(e) {
    store_input.innerHTML = "";
    store_link_explain_span.style.color = "gray";
    store_link_explain_span.textContent = "예시) '한솥도시락' 어때요? 배달의민족 ... https://baemin.me/example";
    store_link_explain_span.style.fontSize = "11px";
    store_link_input_box.style.borderColor = "#dddfe2";
    document.getElementsByClassName("delete-line-icon")[1].classList.add("hidden");
}

store_input.addEventListener('input', change_store_result);

let categoryResult;

const category = ()=>{
    const categoryHtml = 
    `
    <div class="category-box">
        <div class="category-row">
            <div class="category-item" data-category="CF">
                <div class="category-emoji">🍰</div>
                <div class="category-name">카페/디저트</div>
            </div>
            <div class="category-item" data-category="CN">
                <div class="category-emoji">🥢</div>
                <div class="category-name">중식</div>
            </div>
            <div class="category-item" data-category="JP">
                <div class="category-emoji">🍣</div>
                <div class="category-name">돈까스/회/일식</div>
            </div>
            <div class="category-item" data-category="CK">
                <div class="category-emoji">🍗</div>
                <div class="category-name">치킨</div>
            </div>
        </div>
        <div class="category-row">
            <div class="category-item" data-category="RN">
                <div class="category-emoji">🍚</div>
                <div class="category-name">백반/죽/국수</div>
            </div>
            <div class="category-item" data-category="SF">
                <div class="category-emoji">🥘</div>
                <div class="category-name">분식</div>
            </div>
            <div class="category-item" data-category="ST">
                <div class="category-emoji">🍲</div>
                <div class="category-name">찜/탕/찌개</div>
            </div>
            <div class="category-item" data-category="PZ">
                <div class="category-emoji">🍕</div>
                <div class="category-name">피자</div>
            </div>
        </div>
        <div class="category-row">
            <div class="category-item" data-category="WF">
                <div class="category-emoji">🍝</div>
                <div class="category-name">양식</div>
            </div>
            <div class="category-item" data-category="MT">
                <div class="category-emoji">🥓</div>
                <div class="category-name">고기/구이</div>
            </div>
            <div class="category-item" data-category="JS">
                <div class="category-emoji">🍖</div>
                <div class="category-name">족발/보쌈</div>
            </div>
            <div class="category-item" data-category="AS">
                <div class="category-emoji">🍜</div>
                <div class="category-name">아시안</div>
            </div>
        </div>
        <div class="category-row">
            <div class="category-item" data-category="FF">
                <div class="category-emoji">🍔</div>
                <div class="category-name">패스트푸드</div>
            </div>
            <div class="category-item" data-category="MM">
                <div class="category-emoji">🌜</div>
                <div class="category-name">야식</div>
            </div>
            <div class="category-item" data-category="LB">
                <div class="category-emoji">🍱</div>
                <div class="category-name">도시락</div>
            </div>
        </div>
    </div>
    `

    return categoryHtml;
}

const addEventToCategory = ()=>{
    const categoryItems = document.getElementsByClassName("category-item");
    const categoryItemsArray = Array.from(categoryItems);

    categoryItemsArray.map((item)=>{
        item.addEventListener('click',()=>{
            fourth_page_button.classList.remove("blue-button-disable")
            fourth_page_button.classList.add("blue-button")
            fourth_page_button.disabled = false;
            categoryItemsArray.map((item)=>{item.classList.remove("selected-item")})
            item.classList.add("selected-item")
            categoryResult = item.dataset.category;
        })
    })
}

const openCategory = (element)=>{
    element.insertAdjacentHTML("beforeend",category())
    addEventToCategory()
}





let pure_store_link;

function change_store_result(e) {
    input_value = e.target.innerHTML;

    if (input_value.includes('baemin')) {

        store_result.innerHTML = input_value.split('\'')[1];
        pure_store_link = "https" + e.target.innerText.split('https')[1];
        goto_name_of_store_span_a[0].setAttribute("href", pure_store_link);
        goto_name_of_store_span_a[1].setAttribute("href", pure_store_link);

        store_input.blur();
        const loading_ling = document.getElementById("baedal-link-loading-ring");
        const fourth_page_before = document.getElementById("baedal-link-before")
        const fourth_page_after = document.getElementById("baedal-link-after")
        const baedal_link_result = document.getElementById("baedal-link-result");
        const baedal_link_page_head = document.querySelectorAll("#fourth-page .name-of-page")[0]

        fourth_page_before.classList.add("hidden")
        fourth_page_after.classList.remove("hidden")
        baedal_link_page_head.innerHTML = "배달 앱 링크를 확인 중 입니다"


        setTimeout(function () {
            loading_ling.classList.add("hidden")
            baedal_link_page_head.textContent = "배달 앱 링크가 확인되었습니다"
            baedal_link_result.textContent = store_result.textContent + "의 카테고리를 선택해 주세요";
            openCategory(baedal_link_result)
            document.getElementById("percentage").style.width = "60%";
        }, 1000)
    }
    else if (input_value.includes('yogiyo')) {
        store_result.innerHTML = input_value.split('\'')[1];
        pure_store_link = "https" + e.target.innerText.split('https')[1];
        goto_name_of_store_span_a[0].setAttribute("href", pure_store_link);
        goto_name_of_store_span_a[1].setAttribute("href", pure_store_link);

        store_input.blur();
        const loading_ling = document.getElementById("baedal-link-loading-ring");
        const fourth_page_before = document.getElementById("baedal-link-before")
        const fourth_page_after = document.getElementById("baedal-link-after")
        const baedal_link_result = document.getElementById("baedal-link-result");
        const baedal_link_page_head = document.querySelectorAll("#fourth-page .name-of-page")[0]

        fourth_page_before.classList.add("hidden")
        fourth_page_after.classList.remove("hidden")
        baedal_link_page_head.innerHTML = "배달 앱 링크를 확인 중 입니다"


        setTimeout(function () {
            loading_ling.classList.add("hidden")
            baedal_link_page_head.textContent = "배달 앱 링크가 확인되었습니다"
            baedal_link_result.textContent = store_result.textContent + "의 카테고리를 선택해 주세요";
            openCategory(baedal_link_result)
            document.getElementById("percentage").style.width = "60%";
        }, 1000)
    }
    else if (input_value.includes('coupangeats')) {
        // pure_store_link = 'https' + input_value.split('https')[1];
        pure_store_link = "https" + e.target.innerText.split('https')[1];
        const loading_ling = document.getElementById("baedal-link-loading-ring");
        const fourth_page_before = document.getElementById("baedal-link-before")
        const fourth_page_after = document.getElementById("baedal-link-after")
        const baedal_link_result = document.getElementById("baedal-link-result");
        const baedal_link_page_head = document.querySelectorAll("#fourth-page .name-of-page")[0]

        fourth_page_before.classList.add("hidden")
        fourth_page_after.classList.remove("hidden")
        baedal_link_page_head.innerHTML = "배달 앱 링크를 확인 중 입니다"

        //쿠팡이츠 fetch
        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            'get_restaurant_name_coupang_eats/',
            {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-type': "text/plain; charset=utf-8"
                }
            },
        );

        fetch(request, {

            method: 'POST',
            mode: 'same-origin',
            body: pure_store_link

        }).then(response => response.json()).then(data => {
            store_result.innerHTML = data.store_name;
            app_link = data.coupang_app_link;
            pure_store_link = app_link
            
            goto_name_of_store_span_a[0].setAttribute("href", app_link);
            goto_name_of_store_span_a[1].setAttribute("href", app_link);
            store_input.blur();
            return data
        }).then((data)=>{
            setTimeout(function () {
                loading_ling.classList.add("hidden")
                baedal_link_page_head.textContent = "배달 앱 링크가 확인되었습니다"
                baedal_link_result.textContent = store_result.textContent + "의 카테고리를 선택해 주세요";
                openCategory(baedal_link_result)
                document.getElementById("percentage").style.width = "60%";
            }, 500)
        });

        
    }
    else {
        store_link_explain_span.textContent = "올바르지 않은 링크입니다.";
        store_link_explain_span.style.color = "red";
        store_link_explain_span.style.fontSize = "12px";
        store_link_input_box.style.borderColor = "red";
        store_input.blur();
    }
    document.getElementsByClassName("delete-line-icon")[1].classList.remove("hidden");
}

//메뉴추가
const add_button = document.getElementsByClassName('add-button')[0];

function delete_menu(e) {
    e.target.parentElement.parentElement.classList.add("delete-menu-animation");
    setTimeout(function () {
        e.target.parentElement.parentElement.remove();
        input_is_all_filled()
    }, 300)
}

add_button.addEventListener('click', add_menu);

function add_menu(e) {
    const menu_receipt_length = document.getElementsByClassName('menu-receipt').length;
    const menu_receipt = document.getElementsByClassName('menu-receipt')[menu_receipt_length - 1];
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
                    <input type="text" class="menu-prices" oninput="input_is_all_filled()" onclick="move_cursor_before_won(event)"onkeyup="number_comma(event)" pattern="[0-9]*" min="0" id="price-box" placeholder="입력하신 메뉴의 가격을 입력해 주세요" spellcheck="false">
                </div>
            </div>
            <div class="menu-receipt-number">                
                <span class="menu-number-span name-of-input-box">수량</span>

                <div class="input-box receipt-box number-box-parent">
                    <div class="input-box receipt-box" id="number-box">
                        <img class="number-button" id="menu-minus-button" onclick="minus_menu_number(event)" src="../../static/image/minus_icon.png">
                        <input type="number" name="menu-number" pattern="[0-9]*" min="1" class="menu-numbers" id="menu-number-input" value="1" spellcheck="false" readonly>
                        <img class="number-button" id="menu-plus-button" onclick="plus_menu_number(event)" src="../../static/image/plus_icon.png">
                    </div>
                </div>
            </div>
        </div>
`
    
    menu_receipt.insertAdjacentHTML('afterend', added_menu);
    input_is_all_filled()
    window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}
//수량 더하고 빼기
function minus_menu_number(e) {
    if (e.target.parentElement.children[1].value > 1) {
        e.target.parentElement.children[1].value--;
    }
}

function minus_menu_number_person(e) {
    if (e.target.parentElement.children[1].value > 2) {
        e.target.parentElement.children[1].value--;
    }
}

function plus_menu_number(e) {
    e.target.parentElement.children[1].value++;
}
//파티장의 총 주문금액
function getWholePrice() {
    const menus = document.getElementsByClassName('menu-receipt');
    const menu_prices = document.getElementsByClassName('menu-prices');
    const menu_numbers = document.getElementsByClassName('menu-numbers');
    const my_price = document.getElementById('my-price');

    let whole_price = 0;

    for (let i = 0; i < menus.length; i++) {
        menu_price = parseInt(menu_prices[i].value.replace(",", ""))
        
        whole_price = whole_price + (menu_numbers[i].value * menu_price);
    }

    if (isNaN(whole_price)) {
        whole_price = "0";
    }
    else {
        whole_price = whole_price.toLocaleString('ko-KR')
    }
    
    my_price.innerHTML = whole_price;
}
//숫자에 단위 콤마 찍기 (메뉴 가격, 목표 금액, 매장 배달비)
function move_cursor_before_won(e) {
    e.target.setSelectionRange(e.target.value.length - 2, e.target.value.length - 2);
}

function number_comma(e) {
    origin_value = parseInt(e.target.value.replace(/\,|원|\s/g, ""))
    
    if (isNaN(origin_value)) {
        e.target.value = "";
    }
    else {
        e.target.value = origin_value.toLocaleString('ko-KR') + " 원"
        e.target.setSelectionRange(e.target.value.length - 2, e.target.value.length - 2);
    }
}

//메뉴명, 가격 모두 입력했는지 확인

function input_is_all_filled() {
    inputs = document.querySelectorAll("#fifth-page input");
    for (input_in_fifth_page of inputs) {
        if (input_in_fifth_page.value == "") {
            fifth_page_button.classList.add("blue-button-disable")
            fifth_page_button.classList.remove("blue-button")
            fifth_page_button.disabled = true
            return false
        }
    }
    fifth_page_button.classList.remove("blue-button-disable")
    fifth_page_button.classList.add("blue-button")
    fifth_page_button.disabled = false
    return true
}

function input_is_all_filled_sixth() {
    inputs = document.querySelectorAll("#sixth-page input");
    for (input_in_sixth_page of inputs) {
        if (input_in_sixth_page.value == "") {
            sixth_page_button.classList.add("blue-button-disable")
            sixth_page_button.classList.remove("blue-button")
            sixth_page_button.disabled = true
            return false
        }
    }
    sixth_page_button.classList.remove("blue-button-disable")
    sixth_page_button.classList.add("blue-button")
    sixth_page_button.disabled = false
    return true
}

//1인당 배달비 계산
const people_minus_button = document.getElementById("people-minus-button");
const people_plus_button = document.getElementById("people-plus-button");
const store_delivery_fee = document.getElementById("delivery-fee");

const people_numbers = document.getElementById("people-number-input");
const one_person_delivery_fee = document.getElementsByClassName("one-person-delivery-fee-span")[0];

people_minus_button.addEventListener("click", calculate_one_person_delivery_fee);
people_plus_button.addEventListener("click", calculate_one_person_delivery_fee);
store_delivery_fee.addEventListener("keyup", calculate_one_person_delivery_fee)


function calculate_one_person_delivery_fee() {
    
    result = Math.ceil(store_delivery_fee.value.replace(/\,|원|\s/g, "") / people_numbers.value / 10) * 10 + " 원";
    one_person_delivery_fee.innerHTML = result;
    one_person_delivery_fee.style.color = "#3684f1";
    one_person_delivery_fee.style.fontSize = "20px"
}


function make_map() {

    function IsPointInPolygon(poly_array, x, y) {
        var inside = false;
        for (var i = 0; i < (poly_array.length - 1); i++) {
            var p1_x = poly_array[i][0];
            var p1_y = poly_array[i][1];
            var p2_x = poly_array[i + 1][0];
            var p2_y = poly_array[i + 1][1];
            if ((p1_y < y && p2_y >= y) || (p2_y < y && p1_y >= y)) { // this edge is crossing the horizontal ray of testpoint
                if ((p1_x + (y - p1_y) / (p2_y - p1_y) * (p2_x - p1_x)) < x) { // checking special cases (holes, self-crossings, self-overlapping, horizontal edges, etc.)
                    inside = !inside;
                }
            }
        }
        return inside;
    }

    var mapOptions = {
        center: new naver.maps.LatLng(36.1435549, 128.3939658),
        zoom: 15
    };

    var kumoh_inner_location = new naver.maps.LatLng(36.1455619, 128.3927003),
        oneroom_location = new naver.maps.LatLng(36.1380865, 128.3966045),
        okgye_location = new naver.maps.LatLng(36.1375118, 128.4121829)

    const kumoh_map_button = document.getElementById("kumoh-map-button");
    const oneroom_map_button = document.getElementById("oneroom-map-button")
    const okgye_map_button = document.getElementById("okgye-map-button")

    function change_location_button_color(location_name) {
        if (location_name == "kumoh-inner") {
            kumoh_map_button.style.backgroundColor = "#3684f1"
            kumoh_map_button.style.color = "white"
            oneroom_map_button.style.backgroundColor = "white"
            oneroom_map_button.style.color = "#3684f1"
            okgye_map_button.style.backgroundColor = "white"
            okgye_map_button.style.color = "#3684f1"
        }
        else if (location_name == "oneroom") {
            kumoh_map_button.style.backgroundColor = "white"
            kumoh_map_button.style.color = "#3684f1"
            oneroom_map_button.style.backgroundColor = "#3684f1"
            oneroom_map_button.style.color = "white"
            okgye_map_button.style.backgroundColor = "white"
            okgye_map_button.style.color = "#3684f1"
        }
        else if (location_name == "okgye") {
            kumoh_map_button.style.backgroundColor = "white"
            kumoh_map_button.style.color = "#3684f1"
            oneroom_map_button.style.backgroundColor = "white"
            oneroom_map_button.style.color = "#3684f1"
            okgye_map_button.style.backgroundColor = "#3684f1"
            okgye_map_button.style.color = "white"
        }
        else {
            kumoh_map_button.style.backgroundColor = "white"
            kumoh_map_button.style.color = "#3684f1"
            oneroom_map_button.style.backgroundColor = "white"
            oneroom_map_button.style.color = "#3684f1"
            okgye_map_button.style.backgroundColor = "white"
            okgye_map_button.style.color = "#3684f1"
        }
    }

    kumoh_map_button.onclick = function (e) {
        e.preventDefault();
        map.setCenter(kumoh_inner_location);
        map.setZoom(16, true);
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.classList.add("blue-button-disable");
        location_name_box.children[0].textContent = "정확한 위치에 핀을 이동시켜 주세요";
        location_name_box.children[1].textContent = "";
        seventh_page_button.disabled = true;

        change_location_button_color("kumoh-inner")
    }

    oneroom_map_button.onclick = function (e) {
        e.preventDefault();
        map.setCenter(oneroom_location);
        map.setZoom(16, true);
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.classList.add("blue-button-disable");
        location_name_box.children[0].textContent = "정확한 위치에 핀을 이동시켜 주세요";
        location_name_box.children[1].textContent = "";
        seventh_page_button.disabled = true;

        change_location_button_color("oneroom")
    }

    okgye_map_button.onclick = function (e) {
        e.preventDefault();
        map.setCenter(okgye_location);
        map.setZoom(15, true);
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.classList.add("blue-button-disable");
        location_name_box.children[0].textContent = "정확한 위치에 핀을 이동시켜 주세요";
        location_name_box.children[1].textContent = "";
        seventh_page_button.disabled = true;

        change_location_button_color("okgye")
    }

    var map = new naver.maps.Map('map', mapOptions);

    const location_name_box = document.getElementById("location-name-box");

    naver.maps.Event.addListener(map, 'drag', function (e) {
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.add("blue-button-disable");
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.disabled = true;
        change_location_button_color("fail")
    });

    naver.maps.Event.addListener(map, 'dragend', function (e) {
        document.getElementById("map-pin").classList.add("pin2")
        document.getElementById("map-pin").classList.remove("pin2-disable")
        final_location_x = map.center.x;
        final_location_y = map.center.y;
        if (IsPointInPolygon(oneroom_left_up_array, map.center.x, map.center.y)) {
            
            location_name_box.children[0].textContent = "원룸좌측위";
            location_name_box.children[1].textContent = "학교 앞 원룸";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("oneroom")
        }
        else if (IsPointInPolygon(oneroom_left_down_array, map.center.x, map.center.y)) {
            
            location_name_box.children[0].textContent = "원룸좌측하단";
            location_name_box.children[1].textContent = "학교 앞 원룸";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("oneroom")
        }
        else if (IsPointInPolygon(oneroom_right_array, map.center.x, map.center.y)) {
            
            location_name_box.children[0].textContent = "원룸우측";
            location_name_box.children[1].textContent = "학교 앞 원룸";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("oneroom")
        }
        else if (IsPointInPolygon(okgye_middle_school_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "옥계중 주변";
            location_name_box.children[1].textContent = "옥계";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("okgye")
        }
        else if (IsPointInPolygon(geosang_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "거상빌딩 주변";
            location_name_box.children[1].textContent = "옥계";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("okgye")
        }
        else if (IsPointInPolygon(sinnari_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "신나리 2차 주변";
            location_name_box.children[1].textContent = "옥계";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("okgye")
        }
        else if (IsPointInPolygon(dormitory_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "기숙사";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(global_buiilding_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "글로벌관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(digital_building_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "디지털관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")

        }
        else if (IsPointInPolygon(main_building_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "본관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")

        }
        else if (IsPointInPolygon(front_door_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "정문 주변";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(library_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "학생회관 & 도서관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(techno_building_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "테크노관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(joint_experiment_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "공동실험실습관 & 대외협력관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else if (IsPointInPolygon(international_building_array, map.center.x, map.center.y)) {
            location_name_box.children[0].textContent = "국제교육관 & 산악협력관";
            location_name_box.children[1].textContent = "학교 내부";
            seventh_page_button.classList.add("blue-button");
            seventh_page_button.classList.remove("blue-button-disable");
            seventh_page_button.disabled = false;
            change_location_button_color("kumoh-inner")
        }
        else {
            
            location_name_box.children[0].textContent = "지원하지 않는 지역입니다";
            location_name_box.children[1].textContent = "";
            document.getElementById("map-pin").classList.remove("pin2")
            document.getElementById("map-pin").classList.add("pin2-disable")
            seventh_page_button.classList.add("blue-button-disable");
            seventh_page_button.classList.remove("blue-button");
            seventh_page_button.disabled = true;
            change_location_button_color("fail")
        }
    });

    naver.maps.Event.addListener(map, 'pinchstart', function (e) {
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.classList.add("blue-button-disable");
        location_name_box.children[0].textContent = "정확한 위치에 핀을 이동시켜 주세요";
        location_name_box.children[1].textContent = "";
        seventh_page_button.disabled = true;
        change_location_button_color("fail")
    })
    naver.maps.Event.addListener(map, 'pinch', function (e) {
        document.getElementById("map-pin").classList.remove("pin2")
        document.getElementById("map-pin").classList.add("pin2-disable")
        seventh_page_button.classList.remove("blue-button");
        seventh_page_button.classList.add("blue-button-disable");
        location_name_box.children[0].textContent = "정확한 위치에 핀을 이동시켜 주세요";
        location_name_box.children[1].textContent = "";
        seventh_page_button.disabled = true;
        change_location_button_color("fail")
    })

    

    kumoh_inner_array = [
        [128.3881252, 36.1476148],
        [128.3861511, 36.1453969],
        [128.3894555, 36.1426591],
        [128.3947341, 36.1412729],
        [128.3966224, 36.1422779],
        [128.395292, 36.1432829],
        [128.3975236, 36.1441147],
        [128.3956354, 36.1449118],
        [128.3953349, 36.1461593],
        [128.3968799, 36.1474762],
        [128.3942621, 36.1491049],
        [128.3916442, 36.1481],
        [128.3881252, 36.1476148]
    ]

    oneroom_left_up_array = [
        [128.3951526, 36.1413898],
        [128.39747, 36.1380974],
        [128.3959733, 36.1375558],
        [128.3951526, 36.1413898]
    ]

    oneroom_left_down_array = [
        [128.39747, 36.1380974],
        [128.3959733, 36.1375558],
        [128.394305, 36.1358099],
        [128.3965366, 36.1346314],
        [128.3984678, 36.1362604],
        [128.39747, 36.1380974]
    ]

    oneroom_right_array = [
        [128.3955549, 36.1413508],
        [128.3972715, 36.1390548],
        [128.4000556, 36.1403718],
        [128.3968906, 36.1421913],
        [128.3955549, 36.1413508],
    ]

    okgye_middle_school_array = [
        [128.4089552, 36.1378374],
        [128.4106933, 36.1365334],
        [128.412662, 36.1372179],
        [128.4121631, 36.1382577],
        [128.410704, 36.1380627],
        [128.4102266, 36.1385609],
        [128.4089552, 36.1378374]
    ]

    geosang_array = [
        [128.4139602, 36.1371832],
        [128.4172003, 36.1366764],
        [128.4169428, 36.1356929],
        [128.413869, 36.135251],
        [128.4139602, 36.1371832]
    ]

    sinnari_array = [
        [128.414156, 36.1374324],
        [128.4172674, 36.1369688],
        [128.4179111, 36.1409198],
        [128.4167309, 36.1409891],
        [128.4164305, 36.1400707],
        [128.4151001, 36.140088],
        [128.414156, 36.1374324]
    ]

    dormitory_array = [
        [128.3887175, 36.1477252],
        [128.388879, 36.1460378],
        [128.3915395, 36.1467405],
        [128.3912772, 36.1479968],
        [128.3887175, 36.1477252]
    ]
    global_buiilding_array = [
        [128.3917308, 36.1462209],
        [128.3930131, 36.1464291],
        [128.3926521, 36.1475358],
        [128.391525, 36.147535],
        [128.3917308, 36.1462209]
    ]

    digital_building_array = [
        [128.3922159, 36.1445646],
        [128.3933734, 36.1448052],
        [128.3930131, 36.1464291],
        [128.3917308, 36.1462209],
        [128.3922159, 36.1445646]
    ]

    main_building_array = [
        [128.3922903, 36.1439326],
        [128.393422, 36.1440949],
        [128.3933734, 36.1448052],
        [128.3922159, 36.1445646],
        [128.3922903, 36.1439326]
    ]

    front_door_array = [
        [128.3924441, 36.1438362],
        [128.3929306, 36.1422877],
        [128.3951871, 36.1427227],
        [128.3950736, 36.1441251],
        [128.3924441, 36.1438362]
    ]

    library_array = [
        [128.3935023, 36.1446341],
        [128.3949137, 36.1448858],
        [128.3948205, 36.1462016],
        [128.3933644, 36.1460094],
        [128.3935023, 36.1446341]
    ]

    techno_building_array = [
        [128.393551, 36.1460334],
        [128.3952146, 36.1463473],
        [128.3947919, 36.1473476],
        [128.3933032, 36.1473971],
        [128.393551, 36.1460334]
    ]

    joint_experiment_array = [
        [128.3938309, 36.1474977],
        [128.3948108, 36.1474266],
        [128.3957904, 36.1467972],
        [128.3967488, 36.1472417],
        [128.3966464, 36.1476491],
        [128.3939503, 36.1481029],
        [128.3938309, 36.1474977]
    ]

    international_building_array = [
        [128.3916253, 36.1478894],
        [128.3937057, 36.147502],
        [128.3941387, 36.1491847],
        [128.3928109, 36.1493745],
        [128.3916253, 36.1478894]
    ]


    var oneroom_left_up = new naver.maps.Polygon({
        map: map,
        paths: [
            oneroom_left_up_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var oneroom_left_down = new naver.maps.Polygon({
        map: map,
        paths: [
            oneroom_left_down_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var oneroom_right = new naver.maps.Polygon({
        map: map,
        paths: [
            oneroom_right_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var okgye_middle_school = new naver.maps.Polygon({
        map: map,
        paths: [
            okgye_middle_school_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var geosang = new naver.maps.Polygon({
        map: map,
        paths: [
            geosang_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var sinnari = new naver.maps.Polygon({
        map: map,
        paths: [
            sinnari_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var dormitory = new naver.maps.Polygon({
        map: map,
        paths: [
            dormitory_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var global_buiilding = new naver.maps.Polygon({
        map: map,
        paths: [
            global_buiilding_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var digital_building = new naver.maps.Polygon({
        map: map,
        paths: [
            digital_building_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var main_building = new naver.maps.Polygon({
        map: map,
        paths: [
            main_building_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

    var front_door = new naver.maps.Polygon({
        map: map,
        paths: [
            front_door_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });
    var library = new naver.maps.Polygon({
        map: map,
        paths: [
            library_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });
    var techno_building = new naver.maps.Polygon({
        map: map,
        paths: [
            techno_building_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });
    var joint_experiment = new naver.maps.Polygon({
        map: map,
        paths: [
            joint_experiment_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });
    var international_building = new naver.maps.Polygon({
        map: map,
        paths: [
            international_building_array
        ],
        fillColor: '#3684f1',
        fillOpacity: 0.1,
        strokeColor: '#3684f1',
        strokeOpacity: 0.6,
        strokeWeight: 3
    });

}

function input_is_all_filled_eighth() {
    inputs = document.querySelectorAll("#eighth-page input");
    for (input_in_eighth_page of inputs) {
        if (input_in_eighth_page.value == "") {
            eighth_page_button.classList.add("blue-button-disable")
            eighth_page_button.classList.remove("blue-button")
            eighth_page_button.disabled = true
            return false
        }
    }
    eighth_page_button.classList.remove("blue-button-disable")
    eighth_page_button.classList.add("blue-button")
    eighth_page_button.disabled = false
    return true
}

function get_final_receipt() {
    let receipt_array = [];

    const menus = document.getElementsByClassName('menu-receipt');
    const menu_name = document.getElementsByClassName('menu-name');
    const menu_prices = document.getElementsByClassName('menu-prices');
    const menu_numbers = document.getElementsByClassName('menu-numbers');

    for (let i = 0; i < menus.length; i++) {
        let menu_array = [];
        menu_array[0] = menu_name[i].value;
        menu_array[1] = parseInt(menu_prices[i].value.replace(",", ""));
        menu_array[2] = parseInt(menu_numbers[i].value);

        receipt_array[i] = menu_array;
    }

    return receipt_array;
}

let final_location_x;
let final_location_y;

function make_json() {
    kakao_link_final = "https" + kakao_link.value.split("https")[1]

    store_name_final = store_result.innerText

    store_input_final = pure_store_link

    receipt_final = get_final_receipt();

    goal_price_final = parseInt(document.getElementById("goal-price").value.replace(/\,|원|\s/g, ""));

    delivery_fee_final = parseInt(document.getElementById("delivery-fee").value.replace(/\,|원|\s/g, ""));

    people_number_final = parseInt(document.getElementById("people-number-input").value);

    one_person_delivery_fee_final = parseInt(document.getElementsByClassName("one-person-delivery-fee-span")[0].innerText.replace(/\,|원|\s/g, ""));

    location_small_final = document.getElementById("location-name-small").innerText;

    location_big_final = document.getElementById("location-name-big").innerText;

    location_x_fianl = final_location_x;

    location_y_final = final_location_y;

    order_predict_final = document.getElementById("order-predict").value;

    party_ending_time_final = document.getElementById("party-ending-time").value;

    let json_data = {
        kakao_link: kakao_link_final,
        store_name: store_name_final,
        store_link: store_input_final,
        receipt: receipt_final,
        goal_price: goal_price_final,
        delivery_fee: delivery_fee_final,
        people_number: people_number_final,
        one_person_delivery_fee: one_person_delivery_fee_final,
        location_name_small: location_small_final,
        location_name_big: location_big_final,
        location_x: location_x_fianl,
        location_y: location_y_final,
        order_predict: order_predict_final,
        party_ending_time: party_ending_time_final,
        category: categoryResult
    }

    return json_data
}

var copyText = document.getElementById("share-link");

async function copyClipboard() {
    try {
        await navigator.clipboard.writeText(copyText.innerText);
        alert("클립보드에 공유 링크가 복사되었습니다\n" + copyText.innerText);
    } catch (err) {
        alert(err)
    }
}