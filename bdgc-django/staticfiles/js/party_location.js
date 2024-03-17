const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString)
const x = urlParams.get('x');
const y = urlParams.get('y');

map = new naver.maps.Map('map', {
center: new naver.maps.LatLng(y, x),
zoom: 18
});
 var my_position_marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(y, x),
    map: map 
})

