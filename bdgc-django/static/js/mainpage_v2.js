const innerHeight = window.innerHeight;
// 사용자에게 보여지고 있는 브라우저의 높이

const scrollHeight = window.scrollY;
// 현재 스크롤 위치

const bodyHeight = document.body.offsetHeight;
//전체 브라우저의 실질적인 높이

const search_button = document.getElementsByClassName("search-button")[0];
const left_arrow_icon = document.getElementById("left-arrow-icon");
const search_bar_box = document.getElementsByClassName("searchbar-box")[0];
const searchbar = document.getElementById("searchbar");
const search_map_box = document.getElementById("search-map-box");
const search_area = document.getElementsByClassName("search-area")[0];
const end_of_page_span = document.getElementById("end-of-page-span");
const skeleton_box_list = document.getElementsByClassName("skeleton-box");
const content_box = document.getElementsByClassName("content-box")[0];
const select_box = document.getElementsByClassName("select-box")[0];
const location_check_modal = document.getElementsByClassName("location-check-modal")[0]
const search_by_map_modal = document.getElementsByClassName("search-by-map-modal")[0]
const my_party_box = document.getElementsByClassName("my-party-box")[0]
const party_box_button = document.getElementById("party-box-button")
const selected_party_box = document.getElementsByClassName("selected-party-box")[0]
const selected_party_box_button = document.getElementById("selected-party-box-button")

const selected_party_explain_span = document.getElementById("selected-party-explain-span")
const selected_party_store_name = document.getElementById("selected-party-store-name")
const selected_party_box_inner_1 = document.getElementById("selected-party-box-inner-1")
const selected_party_box_inner_2 = document.getElementById("selected-party-box-inner-2")
const selected_party_participation_fee = document.getElementById("selected-party-participation-fee")
const selected_party_delivery_fee = document.getElementById("selected-party-delivery-fee")
const selected_party_order_time = document.getElementById("selected-party-order-time")
const selected_party_participate_button = document.getElementById("selected-party-participate-button")

const my_party_leave_button = document.getElementsByClassName("my-party-leave-button")

const my_party = document.getElementsByClassName("my-party")[0];


get_user_location();
joined_party_loading();
scroll_loading();

search_button.addEventListener("click", function () {
  if (searchbar.value == "") {
    focusAndOpenKeyboard(searchbar, modalFadeInDuration);
    search_bar_box.style.visibility = "visible";
    // search_map_box.style.top = "70px";
    // search_area.classList.add("make-blur");
  }
});



left_arrow_icon.addEventListener("click", function () {
  search_bar_box.style.visibility = "hidden";
  // search_map_box.style.top = "113px";
  searchbar.value = "";
  // search_area.classList.remove("make-blur");
});

function focusAndOpenKeyboard(el, timeout) {
  if (!timeout) {
    timeout = 100;
  }
  if (el) {
    var __tempEl__ = document.createElement("input");
    __tempEl__.style.position = "absolute";
    __tempEl__.style.top = el.offsetTop + 7 + "px";
    __tempEl__.style.left = el.offsetLeft + "px";
    __tempEl__.style.height = 0;
    __tempEl__.style.opacity = 0;
    document.body.appendChild(__tempEl__);
    __tempEl__.focus();

    setTimeout(function () {
      el.focus();
      el.click();
      document.body.removeChild(__tempEl__);
    }, timeout);
  }
}

var modalFadeInDuration = 300;

var lastScrollTop = 0;

// element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
document.addEventListener(
  "scroll",
  function () {
    // or window.addEventListener("scroll"....
    var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (st > lastScrollTop) {
      // downscroll code
      search_map_box.style.top = "70px";
    } else {
      // upscroll code
      search_map_box.style.top = "113px";
    }
    lastScrollTop = st <= 0 ? 0 : st;
  },
  false
);

function request_json_for_search(location, search_keyword, last_pk) {
  let json_data = {
    location: location,
    search_keyword: search_keyword,
    last_pk: last_pk,
  };
  return json_data;
}

function get_user_location() {

  const request = new Request(
    '/common/myPage/check_myinfo',
    {
      headers: {
        'Content-type': "application/json; charset=utf-8"
      }
    },
  );
  fetch(request, {
    method: "GET",
    mode: 'same-origin',
  }).then(response => response.json()).then(result => {
    if (result.success == true) {
      if (result.place == "학교 내부") {
        select_box.selectedIndex = 1;
      }
      else if (result.place == "학교 앞 원룸") {
        select_box.selectedIndex = 2;
      }
      else if (result.place == "옥계") {
        select_box.selectedIndex = 3;
      }
    }
    else {
      // 로그인 아님. 
      select_box.selectedIndex = 0;
    }
    first_loading()
  });
}

function first_loading() {

  end_of_page_span.textContent = "";

  // fetch("../../json_example/first_page.json")

  let location = select_box.options[select_box.selectedIndex].value;
  // url_for_fecth = `https://baedalgachi.run.goorm.io/party/get_more_parties?location=${location}&search_keyword=${searchbar.value}&last_share_id=`
  url_for_fecth = `/party/get_more_parties?location=${location}&search_keyword=${searchbar.value}&last_share_id=`
  fetch(url_for_fecth)
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      if (response.success == true) {
        if (response.party_list.length == 1) {
          skeleton_box_list[1].remove();
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[0]).element
          );
        } else {
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[0]).element
          );
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[1]).element
          );
          for (let i = 2; i < response.party_list.length; i++) {
            content_box.lastElementChild.insertAdjacentHTML(
              "afterend",
              party_object(response.party_list[i]).html
            );
          }
        }
      } else if (response.success == false) {
        for (let skeleton_box of skeleton_box_list) {
          skeleton_box.classList.add("hidden");
        }
        end_of_page_span.textContent = "현재 진행 중인 파티가 없습니다😭";
      } else {
        for (let skeleton_box of skeleton_box_list) {
          skeleton_box.classList.add("hidden");
        }
        end_of_page_span.textContent = "서버와의 연결에 실패하였습니다🤦‍♂️";
      }
    })
    .catch((error) => {
      for (let skeleton_box of skeleton_box_list) {
        skeleton_box.classList.add("hidden");
      }
      end_of_page_span.textContent = "오류가 발생했습니다🤔";
    });
}

function scroll_loading() {

  end_of_page_span.textContent = "";

  const scrolling = async (e) => {
    
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !content_box.lastElementChild.classList.contains("skeleton-box")) {
      content_box.lastElementChild.insertAdjacentHTML(
        "afterend",
        skeleton_element().html
      );
      content_box.lastElementChild.insertAdjacentHTML(
        "afterend",
        skeleton_element().html
      );
      let location = select_box.options[select_box.selectedIndex].value;
      url_for_fecth = `/party/get_more_parties?location=${location}&search_keyword=${searchbar.value}&last_share_id=`
      fetch(url_for_fecth)  
        .then((response) => response.json())
        .then((response) => {
          if (response.success == true) {
            if (response.party_list.length == 1) {
              skeleton_box_list[1].remove();
              skeleton_box_list[0].replaceWith(
                party_object(response.party_list[0]).element
              );
            } else {
              skeleton_box_list[0].replaceWith(
                party_object(response.party_list[0]).element
              );
              skeleton_box_list[0].replaceWith(
                party_object(response.party_list[1]).element
              );
              for (let i = 2; i < response.party_list.length; i++) {
                content_box.lastElementChild.insertAdjacentHTML(
                  "afterend",
                  party_object(response.party_list[i]).html
                );
              }
            }
          } else if (response.success == false) {
            for (let skeleton_box of skeleton_box_list) {
              skeleton_box.classList.add("hidden");
            }
            end_of_page_span.textContent = "더 이상 파티를 찾을 수 없습니다😭";
          } else {
            for (let skeleton_box of skeleton_box_list) {
              skeleton_box.classList.add("hidden");
            }
            end_of_page_span.textContent = "서버와의 연결에 실패하였습니다🤦‍♂️";
          }
        })
        .catch((error) => {

          for (let skeleton_box of skeleton_box_list) {
            skeleton_box.classList.add("hidden");
          }
          end_of_page_span.textContent = "오류가 발생했습니다🤔";
        });
    }

  };
  
  window.onscroll = scrolling;
  
  
}

select_box.addEventListener("change", change_location);

function change_location() {
  end_of_page_span.textContent = "";

  content_box.innerHTML = "";
  content_box.insertAdjacentHTML("afterbegin", explain_element().html);
  content_box.insertAdjacentHTML("beforeend", skeleton_element().html);
  content_box.insertAdjacentHTML("beforeend", skeleton_element().html);
  let location = select_box.options[select_box.selectedIndex].value;

  if (location == "") {
    search_by_map_fetch("")
  }
  else if (location == "학교 내부") {
    search_by_map_fetch("학교 내부")
  }
  else if (location == "학교 앞 원룸") {
    search_by_map_fetch("학교 앞 원룸")
  }
  else if (location == "옥계") {
    search_by_map_fetch("옥계")
  }
  fetch(`/party/get_more_parties?location=${location}&search_keyword=&last_share_id=`)
    .then((response) => response.json())
    .then((response) => {

      if (response.success == true) {
        if (response.party_list.length == 1) {
          skeleton_box_list[1].remove();
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[0]).element
          );
        } else {
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[0]).element
          );
          skeleton_box_list[0].replaceWith(
            party_object(response.party_list[1]).element
          );
          for (let i = 2; i < response.party_list.length; i++) {
            content_box.lastElementChild.insertAdjacentHTML(
              "afterend",
              party_object(response.party_list[i]).html
            );
          }
        }
      } else if (response.success == false) {
        for (let skeleton_box of skeleton_box_list) {
          skeleton_box.classList.add("hidden");
        }
        end_of_page_span.textContent = "현재 진행 중인 파티가 없습니다😭";
      } else {
        for (let skeleton_box of skeleton_box_list) {
          skeleton_box.classList.add("hidden");
        }
        end_of_page_span.textContent = "서버와의 연결에 실패하였습니다🤦‍♂️";
      }
    })
    .catch((error) => {

      for (let skeleton_box of skeleton_box_list) {
        skeleton_box.classList.add("hidden");
      }
      end_of_page_span.textContent = "오류가 발생했습니다🤔";
    });
}

function search_by_keyword() {
  end_of_page_span.textContent = "";
  if (search_bar_box.style.visibility == "visible" && searchbar.value != "") {
    content_box.innerHTML = "";
    content_box.insertAdjacentHTML("afterbegin", explain_element().html);
    content_box.insertAdjacentHTML("beforeend", skeleton_element().html);
    content_box.insertAdjacentHTML("beforeend", skeleton_element().html);
    let location = select_box.options[select_box.selectedIndex].value;
    url_for_fecth = `/party/get_more_parties?location=${location}&search_keyword=${searchbar.value}&last_share_id=&is_search=True`
    fetch(url_for_fecth)
      .then((response) => response.json())
      .then((response) => {

        if (response.success == true) {
          if (response.party_list.length == 1) {
            skeleton_box_list[1].remove();
            skeleton_box_list[0].replaceWith(
              party_object(response.party_list[0]).element
            );
          } else {
            skeleton_box_list[0].replaceWith(
              party_object(response.party_list[0]).element
            );
            skeleton_box_list[0].replaceWith(
              party_object(response.party_list[1]).element
            );
            for (let i = 2; i < response.party_list.length; i++) {
              content_box.lastElementChild.insertAdjacentHTML(
                "afterend",
                party_object(response.party_list[i]).html
              );
            }
          }
        } else if (response.success == false) {
          for (let skeleton_box of skeleton_box_list) {
            skeleton_box.classList.add("hidden");
          }
          end_of_page_span.textContent = "검색된 파티가 없습니다😭";
        } else {
          for (let skeleton_box of skeleton_box_list) {
            skeleton_box.classList.add("hidden");
          }
          end_of_page_span.textContent = "서버와의 연결에 실패하였습니다🤦‍♂️";
        }
      })
      .catch((error) => {

        for (let skeleton_box of skeleton_box_list) {
          skeleton_box.classList.add("hidden");
        }
        end_of_page_span.textContent = "오류가 발생했습니다🤔";
      });
    searchbar.blur();
    // search_map_box.style.top = "70px";
  }
}

search_map_box.addEventListener('click', search_by_map)

function search_by_map_fetch(location_name) {
  let map;
  if (location_name == "") {
    map = new naver.maps.Map('map-for-search', {
      center: new naver.maps.LatLng(36.1447302, 128.4037724),
      zoom: 14
    });
  }
  else if (location_name == "학교 내부") {
    map = new naver.maps.Map('map-for-search', {
      center: new naver.maps.LatLng(36.1455619, 128.3927003),
      zoom: 15
    });
  }
  else if (location_name == "학교 앞 원룸") {
    map = new naver.maps.Map('map-for-search', {
      center: new naver.maps.LatLng(36.1380865, 128.3966045),
      zoom: 15
    });
  }
  else if (location_name == "옥계") {
    map = new naver.maps.Map('map-for-search', {
      center: new naver.maps.LatLng(36.1375118, 128.4121829),
      zoom: 15
    });
  }

  fetch(`/party/get_location_list?location=${location_name}`)
    .then((response) => response.json())
    .then((response) => {

      for (let coordinate of response.coordinates_array) {
        let marker = new naver.maps.Marker({
          title: coordinate[2],
          position: new naver.maps.LatLng(coordinate[1], coordinate[0]),
          map: map,
        });
        let infoWindow = new naver.maps.InfoWindow({
          content: '<div style="width:150px;text-align:center;padding:10px;">The Letter is <b>"' + coordinate[2] + '"</b>.</div>'
        });
        naver.maps.Event.addListener(marker, 'click', function () {
          fetch(`/party/get_party_by_location?party_pk=${marker.title}`)
            .then((response) => response.json())
            .then((response => {
              selected_party_explain_span.style.display = "none";
              selected_party_box_inner_1.style.display = "flex";
              selected_party_box_inner_2.style.display = "block";
              selected_party_box_button.style.display = "block";

              selected_party_store_name.textContent = response.restaurant_name;
              selected_party_box_inner_2.textContent = `${response.headcount}/${response.required_people_number}`
              selected_party_participation_fee.textContent = `${response.participation_fee.toLocaleString('ko-KR')}원`
              selected_party_delivery_fee.textContent = `${response.delivery_cost.toLocaleString('kr-KR')}원`
              selected_party_order_time.textContent = `${response.order_time}`
              selected_party_participate_button.addEventListener('click', function () {
                location.href = `/${response.share_url}/join`
              })

            }))
        })
      }
    })
    .catch((error) => {

    });

}

function search_by_map() {
  if (my_party_box.classList.contains("open")) {
    my_party_box.classList.toggle("open")
    my_party_box.style.height = "50px"
    my_party_box.style.paddingTop = "0px"
    my_party_box.style.borderRadius = "45px"
    party_box_button.style.transform = "rotate(360deg)"
  }
  search_by_map_modal.style.display = "block"
  let location = select_box.options[select_box.selectedIndex].value;
  if (location == "") {
    search_by_map_fetch("")
  }
  else if (location == "학교 내부") {
    search_by_map_fetch("학교 내부")
  }
  else if (location == "학교 앞 원룸") {
    search_by_map_fetch("학교 앞 원룸")
  }
  else if (location == "옥계") {
    search_by_map_fetch("옥계")
  }


}

function search_by_map_close() {
  search_by_map_modal.style.display = "none"
}

function check_location(x, y) {

  location_check_modal.style.display = "block"
  // var map = new naver.maps.Map('map', mapOptions);

  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(y, x),
    zoom: 16
  });

  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(y, x),
    map: map,
  });
}

function check_location_close() {
  location_check_modal.style.display = "none"
}

function party_object(party_dict) {
  let left_time;
  if(party_dict.left_time < 60){
    left_time = party_dict.left_time + "분"
  }
  else if (party_dict.left_time >= 60){
    if(party_dict.left_time % 60 == 0){
      left_time = Math.floor(party_dict.left_time/60) + "시간"
    }
    else{
      left_time = Math.floor(party_dict.left_time/60) + "시간 " + (party_dict.left_time%60) + "분"
    }
  }
  let party_element = `
  <div class="party-box">
        <div class="party-box-header">
          <span class="party-store-name">${party_dict.restaurant_name}</span>
          <div class="party-box-header-small">
            <span class="party-location-small">${party_dict.location_small}</span>
            <span class="party-left-time">파티 종료까지 ${left_time}</span>
          </div>
        </div>
        <div class="party-content-box">
          <div class="party-condition">
            <span class="name-of-party-condition">최소 참가 금액</span>
            <span class="party-condition">${party_dict.participation_fee}</span>
            <span>원</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">인당 배달비</span>
            <span class="party-condition">${party_dict.delivery_cost}</span>
            <span>원</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">참가 인원</span>
            <span class="party-people-number">${party_dict.headcount}</span>
            <span class="party-people-number">/</span>
            <span class="party-people-number">${party_dict.required_people_number}</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">주문예상시간</span>
            <span class="party-condition">${party_dict.order_time}</span>
          </div>
        </div>
        <div class="party-button-area">
          <button onclick="check_location(${party_dict.location_x},${party_dict.location_y})">모집</br>장소</button>
          <button onclick="location.href='/${party_dict.share_url}/join'">참가</button>
        </div>
    </div>
  `;
  return {
    element: document.createRange().createContextualFragment(party_element),
    html: party_element,
  };
}

function skeleton_element() {
  let skeleton_html = `
  <div class="skeleton-box">
  <div class="party-box-header">
    <span class="party-store-name"></span>
    <div class="party-box-header-small">
      <span class="party-location-small"></span>
      <span class="party-left-time"></span>
    </div>
  </div>
  <div class="party-content-box">
    <div class="party-condition">
      <span class="name-of-party-condition">최소 참가 금액</span>
      <span class="party-condition"></span>
      <span>원</span>
    </div>
    <div class="party-condition">
      <span class="name-of-party-condition">인당 배달비</span>
      <span class="party-condition"></span>
      <span>원</span>
    </div>
    <div class="party-condition">
      <span class="name-of-party-condition">참가 인원</span>
      <span class="party-people-number"></span>
      <span class="party-people-number">/</span>
      <span class="party-people-number"></span>
    </div>
    <div class="party-condition">
      <span class="name-of-party-condition">주문예상시간</span>
      <span class="party-condition"></span>
    </div>
  </div>
  <div class="party-button-area">
    <button>모집장소</button>
    <button>참가</button>
  </div>
</div>
  `;
  return {
    element: document.createRange().createContextualFragment(skeleton_html),
    html: skeleton_html,
  };
}

function explain_element() {
  let explain_html = `
  <div id="explain-box">
        <div id="explain-box-header">
          파티를 생성하여 같이 배달시켜 보세요 👍
        </div>
        <div id="explain-box-content">
          최소주문금액을 맞출 수 있어요 🤑
          <br />
          배달비를 나누어서 계산 할 수 있어요 👥
        </div>
        <div id="explain-box-button-area">
          <button onclick="location.href='https://fabulous-dimple-deb.notion.site/ede9b206c31b4d96a9b79c3a1c0ddcce'">사용방법</button>
          <button onclick="location.href='/party/create'">파티생성</button>
        </div>
      </div>
  `;
  return {
    element: document.createRange().createContextualFragment(explain_html),
    html: explain_html,
  };
}

party_box_button.addEventListener('click', open_my_party_box)

function open_my_party_box() {

  if (!my_party_box.classList.contains("open")) {

    my_party_box.classList.toggle("open")
    my_party_box.style.height = "200px"
    my_party_box.style.paddingTop = "5px"
    my_party_box.style.borderRadius = "30px"
    party_box_button.style.transform = "rotate(180deg)"
    setTimeout(() => {
      my_party_leave_button[0].style.display = "block"
      if (my_party_leave_button.length == 2) {
        my_party_leave_button[1].style.display = "block"
      }
    }, 100);
  }
  else {

    my_party_box.classList.toggle("open")
    my_party_box.style.height = "50px"
    my_party_box.style.paddingTop = "0px"
    my_party_box.style.borderRadius = "45px"
    party_box_button.style.transform = "rotate(360deg)"
    setTimeout(() => {
      my_party_leave_button[0].style.display = "none"
      if (my_party_leave_button.length == 2) {
        my_party_leave_button[1].style.display = "none"
      }

    }, 400);

  }
}

selected_party_box_button.addEventListener('click', function () {
  if (!selected_party_box.classList.contains("open")) {

    selected_party_box.classList.toggle("open")
    selected_party_box.style.height = "220px"
    selected_party_box.style.paddingTop = "5px"
    selected_party_box.style.borderRadius = "30px"
    selected_party_box_button.style.transform = "rotate(180deg)"
    setTimeout(() => {
      selected_party_participate_button.style.display = "block"
    }, 300);
  }
  else {

    selected_party_box.classList.toggle("open")
    selected_party_box.style.height = "50px"
    selected_party_box.style.paddingTop = "0px"
    selected_party_box.style.borderRadius = "45px"
    selected_party_box_button.style.transform = "rotate(360deg)"
    selected_party_participate_button.style.display = "none"
  }
})


function leave_party(share_url) {
  if (confirm("정말로 파티를 나가시겠습니까?")) {
    location.href = `/party/${share_url}/leave/`;
  }
}

function joined_party_loading() {
  fetch("../../party/get_joined_party_json/")
    .then((response) => response.json())
    .then((response) => {
      if (response.success == true) {
        my_party.classList.remove("hidden");
        for (let party_dict of response.list) {
          let button_text = "파티 나가기";
          if (party_dict.is_host) {

            button_text = "파티 종료";
          }
          my_party_box.insertAdjacentHTML("beforeend",
            `
        <div class="my-parties">
            <div class="my-party-box-inner-1">
              <span>
                참여중인 파티
              </span>
              <div class="my-party-store-name">
                ${party_dict.restaurant_name}
              </div>
            </div>
    
            <div class="my-party-box-inner-2">
              ${party_dict.headcount}/${party_dict.required_people_number}
            </div>   
    
            <button class="my-party-leave-button" onclick="leave_party('${party_dict.share_url}')">
              ${button_text}
            </button>
          </div>
        `
          )
        }

      }
    })
}