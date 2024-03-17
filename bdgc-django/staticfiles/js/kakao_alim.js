const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString)
const is_host = urlParams.get('is_host');

var varUA = navigator.userAgent.toLowerCase();

if(is_host == "host"){
 
    if ( varUA.indexOf('android') > -1) {
        alert("파티원들에게 모집알림을 보냈습니다.")
        location.href = "kakaotalk://inappbrowser/close";
    } 
    else if ( varUA.indexOf("iphone") > -1||varUA.indexOf("ipad") > -1||varUA.indexOf("ipod") > -1 ) {
        alert("파티원들에게 모집알림을 보냈습니다.")
        location.href = "kakaotalk://"   
    }
    else{
        alert("파티원들에게 모집알림을 보냈습니다.")
        window.close();
    }
}
else if(is_host == "not_host"){
    if ( varUA.indexOf('android') > -1) {
        alert("수령완료 되었습니다.")
        location.href = "kakaotalk://inappbrowser/close";
    } 
    else if ( varUA.indexOf("iphone") > -1||varUA.indexOf("ipad") > -1||varUA.indexOf("ipod") > -1 ) {
        alert("수령완료 되었습니다.")
        location.href = "kakaotalk://"   
    }
    else{
        alert("수령완료 되었습니다.")
        window.close();
    }
}



