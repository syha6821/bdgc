const foodCategory = ()=>{
    const category = {
        CF : {name:"카페/디저트"},
        CN : {name:"중식"}, 
        JP : {name:"돈까스/회/일식"},
        CK : {name:"치킨"},
        RN : {name:"백반/죽/국수"},
        SF : {name:"분식"},
        ST : {name:"찜/탕/찌개"},
        PZ : {name:"피자"},
        WF : {name:"양식"},
        MT : {name:"고기/구이"},
        JS : {name:"족발/보쌈"},
        AS : {name:"아시안"},
        FF : {name:"패스트푸드"},
        MM : {name:"야식"},
        LB : {name:"도시락"}
    }
    
    return category
}

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

// 차트 선언
var partyDoughuntChart
var partyBarChart
var partyBarChartPer
var monthPartyMixedChart
var monthPartyBarChart

// 도넛 라디오 , 셀렉트박스 값. (디폴트)
var doughnutRadioButtonValue = "타입별";
var doughnutSelectBoxValue = "한달전";

// 믹스 셀렉트 박스 값(디폴트)
var mixedSelectBoxValue = "이전3개월";

// 도넛 라디오 버튼 이벤트
const doughnutRadioButtons = document.getElementsByName("doughnutChartRadioOptions");
const doughnutRadioButtonsArray = Array.from(doughnutRadioButtons);
doughnutRadioButtonsArray.map(element => element.addEventListener('change',
  function (event) {
    doughnutRadioButtonValue = event.target.value;
    printPartyChart(doughnutRadioButtonValue , doughnutSelectBoxValue)
  }
))

// 도넛 셀렉트박스 버튼 이벤트
const doughnutSelectBox = document.getElementsByName("doughnutChartSelectBox");
const doughnutSelectBoxArray = Array.from(doughnutSelectBox);
doughnutSelectBoxArray.map(element => element.addEventListener('change',
  function (event) {
    doughnutSelectBoxValue = event.target.value
    printPartyChart(doughnutRadioButtonValue , doughnutSelectBoxValue)
  }
))

// 믹스 셀렉트박스 버튼 이벤트
const mixedSelectBox = document.getElementsByName("mixedChartSelectBox");
const mixedSelectBoxArray = Array.from(mixedSelectBox);
mixedSelectBoxArray.map(element => element.addEventListener('change',
  function (event) {
    mixedSelectBoxValue = event.target.value
    printMonthPartyChart(mixedSelectBoxValue)
  }
))

// 첫 화면 로딩
function onpageLoading() {
  printPartyChart(doughnutRadioButtonValue , doughnutSelectBoxValue)
  printMonthPartyChart(mixedSelectBoxValue)
}

// 파티 집계 도넛차트 출력함수
function printPartyChart(type,month) {

  let data = {
    doughnut_type: type,
    doughnut_month: month
  }
  var csrftoken = getCookie('csrftoken');
  const request = new Request(
    'statistics/get_party_static_doughunt_chart',
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
  }).then(response => response.json()).then(result => {
    if (result.success == true) {

    result.statistics.map((item)=>{
        try{
            item.name = foodCategory()[item.name]['name'];
        }catch{
        }
        })
      drawPartyDoughuntChart(result.statistics);
      drawPartyBarChart(result.statistics);
      drawPartyBarChartPer(result.statistics);
    }
    else {
      alert(result.message)
    }
  });
}

// 월 별 파티 믹스 및 바 차트 출력함수
function printMonthPartyChart(month) {
  let data = {
    month: month,
  }
  var csrftoken = getCookie('csrftoken');
  const request = new Request(
    'statistics/get_party_static_mixed_chart',
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
  }).then(response => response.json()).then(result => {
    if (result.success == true) {
      drawMonthPartyMixedChart(result.statistics)
      drawMonthPartyBarChartPer(result.statistics)
    }
    else {
      alert(result.message)
    }
  });
}

// 서버에서 받아온 데이터로 파티 도넛 차트를 그리는 함수
function drawPartyDoughuntChart(statistics) {
  var created_total = 0;
  var success_total = 0;
  const get_data= []
  const get_labels = []
  
  const backgroundColor = [
    'rgba(255, 99, 132 ,0.3)',
    'rgba(54, 162, 235, 0.3)',
    'rgba(255, 206, 86, 0.3)',
    'rgba(75, 192, 192, 0.3)',
    'rgba(153, 102, 255, 0.3)',
    'rgba(255, 159, 64, 0.3)',
    'rgba(75, 72, 64, 0.3)',
  ]

  const borderColor = [
    'rgba(255, 99, 132)',
    'rgba(54, 162, 235)',
    'rgba(255, 206, 86)',
    'rgba(75, 192, 192)',
    'rgba(153, 102, 255)',
    'rgba(255, 159, 64)',
    'rgba(75, 72, 64)',
  ]

  for( var i =0 ; i < statistics.length ; i++){
    get_data[i] = statistics[i].success;
    get_labels[i] = statistics[i].name;
    created_total += statistics[i].created;
    success_total += statistics[i].success;
  }

  const data = {
    labels: get_labels,
    datasets: [{
      label: '타입',
      data: get_data,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      borderWidth: 1,
      hoverOffset: 10,
      cutout: '50%'
    }]
  };

  const created_total_text = {
    id: 'created_total_text',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { top, right, bottom, left, width, height } } = chart;
      ctx.save();
      ctx.fillStyle = options.fontColor;
      ctx.textAlign = 'center';
      ctx.font = options.fontSize + " " + options.fontFamily;
      ctx.fillText(options.text, (width / 2) + 15, top + (height / 2) +20)
    }
  };
  const success_total_text = {
    id: 'success_total_text',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { top, right, bottom, left, width, height } } = chart;
      ctx.save();
      ctx.fillStyle = options.fontColor;
      ctx.textAlign = 'center';
      ctx.font = options.fontSize + " " + options.fontFamily;
      ctx.fillText(options.text, (width / 2 ) , top + (height / 2))
    }
  };
  const success_total_label = {
    id: 'success_total_label',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { top, right, bottom, left, width, height } } = chart;
      ctx.save();
      ctx.fillStyle = options.fontColor;
      ctx.textAlign = 'center';
      ctx.font = options.fontSize + " " + options.fontFamily;
      ctx.fillText(options.text, width / 2, top + (height / 2) - 20)
    }
  };
  const created_total_label = {
    id: 'created_total_label',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { top, right, bottom, left, width, height } } = chart;
      ctx.save();
      ctx.fillStyle = options.fontColor;
      ctx.textAlign = 'center';
      ctx.font = options.fontSize + " " + options.fontFamily;
      ctx.fillText(options.text, (width / 2) + 20, top + (height / 2) +35)
    }
  };

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      radius: '90%',
      plugins: {
        datalabels:{
          formatter: (value, categories) => {
            
            let percentage = (value*100 / success_total).toFixed(1)+"%";
            return percentage;
          },
        },
        created_total_text: {
          text:  "/"  + created_total,
          fontColor: 'rgba(75, 75, 75)',
          fontSize: '1rem',
          fontFamily: 'sans-serif'
        },
        success_total_text: {
          text: success_total,
          fontColor: 'rgba(75, 75, 75)',
          fontSize: '1.8rem',
          fontFamily: 'sans-serif'
        },
        success_total_label: {
          text: "성공한파티",
          fontColor: 'rgba(75, 75, 75)',
          fontSize: '0.625rem',
          fontFamily: 'sans-serif'
        },
        // created_total_label: {
        //   text: "(총합)",
        //   fontColor: 'rgba(75, 75, 75)',
        //   fontSize: '8px',
        //   fontFamily: 'sans-serif'
        // },
      }
    },
    plugins: [created_total_text , success_total_text,  success_total_label, ChartDataLabels], 
  };
  if (partyDoughuntChart){partyDoughuntChart.destroy();}
  partyDoughuntChart = new Chart(document.getElementById("partyDoughuntChart").getContext("2d"), config);
}


// 서버에서 받아온 데이터로 파티 바 차트를 그리는 함수
function drawPartyBarChart(statistics) {
  var created_total = 0;
  var success_total = 0;
  const get_labels = []
  const get_created =[]
  const get_success = []

  for( var i =0 ; i < statistics.length ; i++){
    get_labels[i] = statistics[i].name;
    success_total += statistics[i].success;
    get_success[i] = statistics[i].success;
    created_total += statistics[i].created;
    get_created[i] = statistics[i].created -statistics[i].success ;
  }

  const data = {
    labels: get_labels,
    datasets: [
      {
        label: '성공한 파티',
        data: get_success,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64,0.6)',
          'rgba(75, 72, 64, 0.6)',
        ],
    },
    {
      label: '실패한 파티',
      data: get_created,
      backgroundColor: [
        'rgba(255, 99, 132, 0.3)',
        'rgba(54, 162, 235, 0.3)',
        'rgba(255, 206, 86, 0.3)',
        'rgba(75, 192, 192, 0.3)',
        'rgba(153, 102, 255, 0.3)',
        'rgba(255, 159, 64, 0.3)',
        'rgba(75, 72, 64, 0.3)',
      ],
  },
  ]
  };
  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      },
      indexAxis: 'y',
    },
    plugins: [ChartDataLabels], 
  };
  if (partyBarChart){partyBarChart.destroy();}
  partyBarChart = new Chart(document.getElementById("partyBarChart").getContext("2d"), config);
};


// 서버에서 받아온 데이터로 파티 성공률 차트를 그리는 함수
function drawPartyBarChartPer(statistics) {

  const startDate = new Date();
  const showMonth = statistics.length;
  startDate.setMonth(startDate.getMonth() - showMonth);
  const labels = [];
  const get_data_ratio= []

  for( var i =0 ; i < statistics.length ; i++){
    labels[i] = statistics[i].name;
    var round = statistics[i].success /statistics[i].created * 100
    get_data_ratio[i] = round.toFixed(1) 
  }

  const data = {
    labels,
    datasets: [{
      type: 'bar',
      label: '성공률(%)',
      data: get_data_ratio,
      backgroundColor: [
       'rgba(120, 225, 225 , 0.6)'
      ],
    }]
  };
  const config = {
    data: data,
    options: {
      scales: {
        y : { // 비율표시. 0~1 로 고정
         min: 0,
         max : 100,
        }
      },
      indexAxis: 'y',
    },
    plugins: [ChartDataLabels]
  };
  if (partyBarChartPer) {partyBarChartPer.destroy();}
  partyBarChartPer = new Chart(document.getElementById("partyBarChartPer").getContext("2d"), config);
}

// 서버에서 받아온 데이터로 월별 믹스 차트를 그리는 함수
function drawMonthPartyMixedChart(statistics) {

  const startDate = new Date();
  const showMonth = statistics.length;
  startDate.setMonth(startDate.getMonth() - showMonth);
  const labels = [];
  const get_data_created= []
  const get_data_success= []

  // x 축 날짜 계산
  for (let i = 0; i < showMonth; i++) {
    const date = moment(startDate).add(i, 'month').format('YY-MM월');  // 날이면 days ,
    labels.push(date.toString());
  }
  // 데이터 입력
  for( var i =0 ; i < statistics.length ; i++){
    get_data_created[i] = statistics[i].created;
    get_data_success[i] = statistics[i].success;
  }
  const data = {
    labels,
    datasets: [{
      type: 'line',
      label: '생성된 파티',
      data: get_data_created,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    }, {
      type: 'line',
      label: '성공한 파티',
      data: get_data_success,
      fill: false,
      borderColor: 'rgb(54, 162, 235)'
    }]
  };
  const config = {
    type: 'line',
    data: data,
    options: {
      }
  };
  if (monthPartyMixedChart) { monthPartyMixedChart.destroy();}
  monthPartyMixedChart = new Chart(document.getElementById("monthPartyMixedChart").getContext("2d"), config);
}

// 서버에서 받아온 데이터로 월별 성공률 차트를 그리는 함수
function drawMonthPartyBarChartPer(statistics) {

  const startDate = new Date();
  const showMonth = statistics.length;
  startDate.setMonth(startDate.getMonth() - showMonth);
  const labels = [];
  const get_data_ratio= []

  // x축 날짜 계산
  for (let i = 0; i < showMonth; i++) {
    const date = moment(startDate).add(i, 'month').format('YY-MM월');
    labels.push(date.toString());
  }
  // 성공률 소수점 아래 첫재까지 반올림 계산후, 데이터 입력
  for( var i =0 ; i < statistics.length ; i++){
    var round = statistics[i].success /statistics[i].created * 100
    get_data_ratio[i] = round.toFixed(1) 
  }
  const data = {
    labels,
    datasets: [{
      type: 'bar',
      label: '성공률(%)',
      data: get_data_ratio,
      backgroundColor: 'rgba(120, 225, 225 , 0.6)'
    }]
  };
  const config = {
    data: data,
    options: {
      scales: {
        y : { // 비율표시. 0~1 로 고정
         min: 0,
         max : 100,
        }
      },
    },
    plugins: [ChartDataLabels]
  };
  if (monthPartyBarChart) {monthPartyBarChart.destroy();}
  monthPartyBarChart = new Chart(document.getElementById("monthPartyBarChartPer").getContext("2d"), config);
}
