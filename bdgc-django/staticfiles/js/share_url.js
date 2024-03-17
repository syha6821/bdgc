const innerHeight = window.innerHeight;
// 사용자에게 보여지고 있는 브라우저의 높이

const scrollHeight = window.scrollY;
// 현재 스크롤 위치

const bodyHeight = document.body.offsetHeight;
//전체 브라우저의 실질적인 높이

const content_box = document.getElementsByClassName("content-box")[0];
const location_check_modal = document.getElementsByClassName("location-check-modal")[0]
const party_box_button = document.getElementById("party-box-button")
const share_map = document.getElementById("map")

map_center_y = Number(share_map.dataset.y) - 0.001;
map_center_x = Number(share_map.dataset.x);

console.log(map_center_y)

var map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(map_center_y, map_center_x),
      zoom: 17
    });
  
var marker = new naver.maps.Marker({
  position: new naver.maps.LatLng(share_map.dataset.y, share_map.dataset.x),
  map: map,
});

