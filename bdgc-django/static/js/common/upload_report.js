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

function UploadButtonClick()
{
    // var formData = new FormData();

    const input_title = document.getElementById('input_title').value;
    const input_type = document.getElementById('input_type').value;
    const input_reason = document.getElementById('input_reason').value;
    const input_file = document.getElementById('input_file').value;

    let data = {   
        input_title : input_title,
        input_type : input_type,
        input_reason : input_reason,
    }

    if (input_file){
        console.log("파일 선택됨")
        console.log(input_file)
    }
    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        '',
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

            // 다음에 이동할 페이지 /common/upload_report/success
            location.replace('success') // 뒤로가기 막고 업로드 완료 페이지 이동.

        }
        else{
            console.log("업로드 실패")
        }
    });
}
