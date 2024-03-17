const innerHeight = window.innerHeight;
// 사용자에게 보여지고 있는 브라우저의 높이

const scrollHeight = window.scrollY;
// 현재 스크롤 위치

const bodyHeight = document.body.offsetHeight;
//전체 브라우저의 실질적인 높이

const content_box = document.getElementsByClassName("content-box")[0];
const location_check_modal = document.getElementsByClassName("location-check-modal")[0]
const party_box_button = document.getElementById("party-box-button")


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

  function check_location_close(){
    location_check_modal.style.display = "none"
  }