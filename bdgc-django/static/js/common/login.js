const open_footer_button = document.getElementById("open-footer-button")
const footer_into = document.getElementById("footer-info")

open_footer_button.addEventListener("click",function(){
    if(open_footer_button.classList.contains("open")){
        open_footer_button.classList.toggle("open")
        footer_into.style.height = "60px"
        setTimeout(() => {
            open_footer_button.innerText = "⌄"
            }, 200);
    }
    else{
        open_footer_button.classList.toggle("open")
        footer_into.style.height = "0"
        setTimeout(() => {
            open_footer_button.innerText = "사이트 정보 확인"
            }, 200);
    }
})