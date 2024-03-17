const getDefaultCenterLatLng = ()=>{
    return {
        "학교 내부":{"lat":36.1438095, "lng":128.3917562},
        "학교 앞 원룸":{"lat":36.1360865, "lng":128.3976045},
        "옥계":{"lat":36.1365118, "lng":128.4121829}
    }
}

const getMyLocation = async ()=>{
    const response = await fetch("common/myPage/check_myinfo");
    const responseJson = await response.json();
    
    const location = responseJson.success ? responseJson.place : "학교 내부";
    
    return location;
}


const drawMapInCurrentPosition = function(currentLocation){
    const explain_box = document.getElementById("explain-box");
    const latitudePointForMiddle = 0.001

    const map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(currentLocation.coords.latitude - latitudePointForMiddle, currentLocation.coords.longitude),
        zoom: 16,
        minZoom: 16,
        maxZoom: 19
    });

    const currentLocationLatlng = new naver.maps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude);

    const myPositionMarker = new naver.maps.Marker({
        position: currentLocationLatlng,
        map: map,
        icon: {
            content: '<div class="map-bg"> <div class="marker"> <div class="pin"></div><div class="pin-effect"></div></div></div>',
        }        
    })
    
    return new Promise(resolve => {
        resolve(map)
    })
}

const drawMapInDefaultPosition = async (error)=>{
    const explain_box = document.getElementById("explain-box");
    const latitudePointForMiddle = 0.001;
    
    const myLocation = await getMyLocation();
    const myLatLng = getDefaultCenterLatLng()[myLocation];

    const map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(myLatLng['lat'] - latitudePointForMiddle, myLatLng['lng']),
        zoom: 16,
        minZoom: 16,
        maxZoom: 19
    });
    
    return new Promise(resolve => {
        resolve(map)
    })
}

const getPosition = ()=>{
    return new Promise((res,rej) =>{
      navigator.geolocation.getCurrentPosition(res,rej);  
    })
}

const minimizeExplainBox = (listener)=>{
    const explain_box = document.getElementById("explain-box");
    const create_party_button = document.getElementById("create-party-button");
    const elements_except_party_create_button_array = Array.from(document.querySelectorAll("#explain-box *:not(#create-party-button)"))
    const my_party = document.getElementsByClassName("my-party")[0];
    const TRANSITON_DURATION_ELEMENTS_EXCEPT_CREATE_PARTY_BUTTON = 500;
    const TRANSITON_DURATION_CREATE_PARTY_BUTTON = 500;
    const CREATE_PARTY_BUTTON_WIDTH_AFTER_DRAG = 300;
    
    elements_except_party_create_button_array.map((element)=>{
        element.style.opacity = 0;
    })
    
    setTimeout(()=>{
        elements_except_party_create_button_array.map((element)=>{
            element.style.display = "none";
        })  
    },TRANSITON_DURATION_ELEMENTS_EXCEPT_CREATE_PARTY_BUTTON)
    
    create_party_button.style.width = `${CREATE_PARTY_BUTTON_WIDTH_AFTER_DRAG}px`;
    create_party_button.style.marginTop = 0;
    
    const explain_box_width = window.getComputedStyle(explain_box).getPropertyValue('width').replace('px','');
    create_party_button.style.right = `${(explain_box_width - CREATE_PARTY_BUTTON_WIDTH_AFTER_DRAG)/2}px`;
    
    explain_box.style.backgroundColor = "#3684f1";
    explain_box.style.height = "45px";
    explain_box.style.border = "none";
    
    create_party_button.style.bottom = "5px"
    create_party_button.style.fontWeight = "600"
    create_party_button.style.fontSize = "17px";
        
     setTimeout(()=>{
        create_party_button.textContent = "빠른 파티생성⚡️";
    },200)
    
    listener ? (()=>{
        return new Promise(resolve => {
            resolve(
                (()=>{
                    naver.maps.Event.removeListener(listener);
                })()
            )
        })
    })()
    :
        (()=>{
        return true;
    })
}

const setLocationNameToMap = (locationName)=>{
    const map = document.getElementById('map');
    map.dataset.locationName = locationName;
}

const addEventToMap = (map)=>{
    const listener = naver.maps.Event.addListener(map, 'drag', ()=>{
        minimizeExplainBox(listener)
    });
    
    const listenerForPartyInfoBox = naver.maps.Event.addListener(map, 'drag', ()=>{
        closePartyInfo();
    })
    
    const getLocationNameByDragMap = naver.maps.Event.addListener(map, 'dragend', (e)=>{
        const locationAfterDrag = getLocationNameOfCurrentMiddleCoord(map.center._lat, map.center._lng)
        const locationBeforeDrag = document.getElementById('map').dataset.locationName;
        
        setLocationNameToMap(locationAfterDrag);
        
        (locationAfterDrag == "notSupport") ? deleteAllMarker():null;

        
        (locationAfterDrag !== locationBeforeDrag) && (locationAfterDrag !== "notSupport") ?
            (async()=>{
            deleteAllMarker();
            const partyList = await getPartiesByLocation(locationAfterDrag)
            const markers = showPinsOfParties(partyList, map)
            addEventToMarkers(markers)
        })()
        :
        (()=>{
        })()

    })
    
    const zoomEvent = naver.maps.Event.addListener(map, 'zoom_changed', (zoom)=>{
        const partyIcons = Array.from(document.getElementsByClassName('party-icon'));
        
        zoom >= 19 ? 
            (()=>{
                partyIcons.map((icon)=>{
                    icon.classList.add("zoomed")
                })        
            })()
            :
            (()=>{
                partyIcons.map((icon)=>{
                    icon.classList.remove("zoomed")
                })
            })()            
        
        
    })
    
    
}

const deleteAllMarker = ()=>{
    const allMarkersBefore = Array.from(document.getElementsByClassName("party-icon"))
    allMarkersBefore.map((marker)=>{
        marker.remove();
    })
}

const showPinsOfParties = (partyList, map)=>{
    const markerPartyMap = partyList.map((party)=>{
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(party.location_y,party.location_x),
            map: map,
            icon: {
                content:
                `
                <div class="party-icon ${party.category} ${party.share_url}">
                    <span class="party-icon-emoji">${foodCategory()[party.category]['emoji']}</span>
                    <span class="party-icon-name">${party.restaurant_name}</span>
                </div>
                `
            }
        })
        
        
        
        return {
            "party":party,
            "marker":marker
        };
    })
    
    
    return markerPartyMap;
}

const addEventToMarkers = (markerPartyMap)=>{
    markerPartyMap.map((markerAndParty)=>{
        const {party,marker} = markerAndParty;
        naver.maps.Event.addListener(marker,'click',()=>
         {
            markerPartyMap.map((markerAndParty)=>markerAndParty.marker.setZIndex(0))
            marker.setZIndex(1)
            const partyIcon = document.getElementsByClassName(party.share_url)[0];
            openPartyInfo(party, partyIcon)
        });
    })
}

const toggleHighlightMarker = (element)=>{
    const highlightedPartyIcons = Array.from(document.getElementsByClassName("highlighted"));
    
    highlightedPartyIcons.map((element)=>{
        element.classList.remove("highlighted")
    })
    
    element.classList.contains("highlighted") ?
        (()=>{
        element.classList.remove("highlighted")
    })()
    :
    (()=>{
        element.classList.add("highlighted")
    })()
}

const getPartiesByLocation = async(location)=>{
    const response = await fetch(`/party/get_more_parties?location=${location}&search_keyword=&last_share_id=`)
    const responseJson = await response.json();
    const partyList = responseJson.success ? responseJson.party_list : []
    
    
    return partyList;
}

const drawMap = async ()=>{
    try{
        const position = await getPosition();
        const map = await drawMapInCurrentPosition(position);
        
        return map;
    } catch(error) {
        const map = await drawMapInDefaultPosition();
        
        return map;
    }
}

const finishLoader = ()=>{
    document.getElementsByClassName("loader")[0].style.display = "none";
}

const startLoader = ()=>{
    document.getElementsByClassName("loader")[0].style.display = "block";
}



const myPartyHtml = (item, isHost)=>{
    const {is_host, restaurant_name, headcount, required_people_number, share_url } = item;
    const buttonText = is_host ? "파티 종료" : "파티 나가기";
    
    const html = `
    <div class="my-parties">
            <div class="my-party-box-inner-1">
              <span>
                참여중인 파티
              </span>
              <div class="my-party-store-name" onclick="location.href='/${share_url}'">
                ${restaurant_name}
              </div>
            </div>
    
            <div class="my-party-box-inner-2">
              ${headcount}/${required_people_number}
            </div>   
    
            <button class="my-party-leave-button" onclick="leaveParty('${share_url}')">
              ${buttonText}
            </button>
  </div>
    `
    
    return html;
}

const joinedPartyLoad = async ()=>{
    const myPartyBox = document.getElementsByClassName("my-party-box")[0];
    const myParty = document.getElementsByClassName("my-party")[0];
    const response = await fetch("../../party/get_joined_party_json/");
    const responseJson = await response.json();
    responseJson.success ?
            (()=>{
                minimizeExplainBox();
                myParty.classList.remove("hidden");
                responseJson.list.map( (listItem)=>{ myPartyBox.insertAdjacentHTML("beforeend",myPartyHtml(listItem, listItem.is_host)) }  );
            })()
        : 
            (()=>{  })()
}

const toggleMyPartyBox = ()=>{
    const myPartyBox = document.getElementsByClassName("my-party-box")[0];
    const myPartyLeaveButton = document.getElementsByClassName("my-party-leave-button");
    const partyBoxButton = document.getElementById("party-box-button");
    
    myPartyBox.classList.contains("open") ?
        (()=>{
            myPartyBox.classList.toggle("open");
            myPartyBox.style.height="50px";
            myPartyBox.style.paddingTop = "0px";
            partyBoxButton.style.transform = "rotate(360deg)"
            setTimeout(()=>{
                myPartyBox.style.borderRadius = "45px";
                Array.from(myPartyLeaveButton).map((element)=>{element.style.display="none"})
            },400)
        })()
        :
        (()=>{
            myPartyBox.classList.toggle("open");
            myPartyBox.style.height="200px";
            myPartyBox.style.paddingTop = "5px";
            partyBoxButton.style.transform = "rotate(180deg)"
            setTimeout(()=>{
                myPartyBox.style.borderRadius = "30px";
                Array.from(myPartyLeaveButton).map((element)=>{element.style.display="block"})
            },100)
        })()
}

const addEventToPartyBoxButton = ()=>{
    const partyBoxButton = document.getElementById("party-box-button");
    partyBoxButton.addEventListener('click',toggleMyPartyBox);
}

const leaveParty = function(shareUrl){
    confirm("정말로 파티를 나가시겠습니까?") ? location.href = `/${shareUrl}/leave/` : false;
}

const foodCategory = ()=>{
    const category = {
        CF : {name:"카페/디저트", emoji:"🍰"},
        CN : {name:"중식", emoji:"🥢"}, 
        JP : {name:"돈까스/회/일식", emoji:"🍣"},
        CK : {name:"치킨",emoji:"🍗"},
        RN : {name:"백반/죽/국수",emoji:"🍚"},
        SF : {name:"분식",emoji:"🥘"},
        ST : {name:"찜/탕/찌개",emoji:"🍲"},
        PZ : {name:"피자",emoji:"🍕"},
        WF : {name:"양식",emoji:"🍝"},
        MT : {name:"고기/구이",emoji:"🥓"},
        JS : {name:"족발/보쌈",emoji:"🍖"},
        AS : {name:"아시안",emoji:"🍜"},
        FF : {name:"패스트푸드",emoji:"🍔"},
        MM : {name:"야식",emoji:"🌜"},
        LB : {name:"도시락",emoji:"🍱"}
    }
    
    return category
}

const locationPolygon = ()=>{
    const locations = {
        "학교 내부" : [
            [128.3853292, 36.1470338],
            [128.3981180, 36.1507763],
            [128.4017658, 36.1425632],
            [128.3878613, 36.1393054],
            [128.3853292, 36.1470338]
        ],
        "학교 앞 원룸" : [
            [128.3922663, 36.1403540],
            [128.4003987, 36.1422428],
            [128.4033170, 36.1364376],
            [128.3943691, 36.1336648],
            [128.3922663, 36.1403540]
        ],
        "옥계" : [
            [128.4072681, 36.1391671],
            [128.4081017, 36.1344259],
            [128.4176591, 36.1352799],
            [128.4181566, 36.1411096],
            [128.4072681, 36.1391671]
        ]
        
    }
    
    return locations;
}

const isPointInPolygon = (poly_array, lat, lng) => {
    const x = lng;
    const y = lat;
    
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

const getLocationNameOfCurrentMiddleCoord = (lat,lng) => {
    const filteredLocation = Object.keys(locationPolygon()).filter((locationName)=>
        isPointInPolygon(locationPolygon()[locationName],lat,lng)
    )
    
    const locationName = filteredLocation[0] ? filteredLocation[0] : "notSupport";
    
    return locationName
}

const partyInfoCard = (partyDict)=>{
    const {
        restaurant_name,
        location_small, 
        participation_fee, 
        delivery_cost, 
        headcount, 
        required_people_number, 
        order_time, 
        share_url
    } = partyDict;
  let leftTime;
  if(partyDict.left_time < 60){
    leftTime = partyDict.left_time + "분"
  }
  else if (partyDict.left_time >= 60){
    if(partyDict.left_time % 60 == 0){
      leftTime = Math.floor(partyDict.left_time/60) + "시간"
    }
    else{
      leftTime = Math.floor(partyDict.left_time/60) + "시간 " + (partyDict.left_time%60) + "분"
    }
  }
  let party_element = `
  <div class="party-box">
        <div class="party-box-header">
          <span class="party-store-name">${restaurant_name}</span>
          <div class="party-box-header-small">
            <span class="party-location-small">${location_small}</span>
            <span class="party-left-time">파티 종료까지 ${leftTime}</span>
          </div>
        </div>
        <div class="party-content-box">
          <div class="party-condition">
            <span class="name-of-party-condition">최소 참가 금액</span>
            <span class="party-condition">${participation_fee}</span>
            <span>원</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">인당 배달비</span>
            <span class="party-condition">${delivery_cost}</span>
            <span>원</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">참가 인원</span>
            <span class="party-people-number">${headcount}</span>
            <span class="party-people-number">/</span>
            <span class="party-people-number">${required_people_number}</span>
          </div>
          <div class="party-condition">
            <span class="name-of-party-condition">주문예상시간</span>
            <span class="party-condition">${order_time}</span>
          </div>
        </div>
        <div class="party-button-area">
          <button onclick="location.href='/${share_url}/join'">참가</button>
        </div>
    </div>
  `;
  return {
    element: document.createRange().createContextualFragment(party_element),
    html: party_element,
  };
}

const openPartyInfo = (partyDict, partyIcon)=>{
    const bottomBox = document.getElementsByClassName("bottom-box")[0];
    const explainBox = document.getElementById("explain-box");
    
    const isPartyBoxOpen = ()=>{
        const isOpen = document.getElementsByClassName("party-box")[0] ? true : false;
        return isOpen;
    }
    

    explainBox.style.bottom = "-50px";
    
    isPartyBoxOpen() ?
        (()=>{
            const partyBox = document.getElementsByClassName("party-box")[0];
            partyBox.replaceWith( partyInfoCard(partyDict).element );
            toggleHighlightMarker(partyIcon)
            document.getElementsByClassName("party-box")[0].style.bottom = "10px";        
        })()
        :
        (()=>{
            bottomBox.insertAdjacentHTML("afterBegin",partyInfoCard(partyDict).html);
            const partyBox = document.getElementsByClassName("party-box")[0];
            toggleHighlightMarker(partyIcon)
            setTimeout(()=>{
                partyBox.style.bottom = "10px";        
            },100)
        })()
    
    
}

const closePartyInfo = ()=>{
    const partyBox = document.getElementsByClassName("party-box");
    const explainBox = document.getElementById("explain-box");
    const highlightedPartyIcons = Array.from(document.getElementsByClassName("highlighted"));
    
    highlightedPartyIcons.map((element)=>{
        element.classList.remove("highlighted")
    })
    
    
    explainBox.style.bottom = "10px";    
    partyBoxes = Array.from(partyBox);
    partyBoxes.map((element)=>{
        element.style.bottom = "-200px";
        setTimeout(()=>{
            element.remove();
        },100)
    })
    // skeletonBox ? skeletonBox.style.bottom = "-200px" : false;
}

const category = ()=>{
    const categoryHtml = 
    `
    <div class="category-box">
        <div class="category-row">
            <div class="category-item selected-item" id="category-all" data-category="ALL">
                <div class="category-name">전체</div>
            </div>
            <div class="category-item" data-category="CF">
                <div class="category-emoji">🍰</div>
                <div class="category-name">카페/디저트</div>
            </div>
            <div class="category-item" data-category="CN">
                <div class="category-emoji">🥢</div>
                <div class="category-name">중식</div>
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
            <div class="category-item" data-category="JP">
                <div class="category-emoji">🍣</div>
                <div class="category-name">돈까스/회/일식</div>
            </div>
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
    const searchAreaCategoryName = document.getElementById("search-area-category-name")

    categoryItemsArray.map((item)=>{
        item.addEventListener('click',(e)=>{
            categoryItemsArray.map((item)=>{item.classList.remove("selected-item")})
            item.classList.add("selected-item")
            
            searchAreaCategoryName.textContent = e.target.querySelectorAll(".category-name")[0].textContent;
            
            
            const partyIcons = document.querySelectorAll(".party-icon");
            const partyIconsArray = Array.from(partyIcons);
            
            item.dataset.category == "ALL" ?
                (()=>{
                    partyIconsArray.map((icon)=>{
                        icon.style.display = "flex";
                    })
                })()
                :
                (()=>{
                    partyIconsArray.map((icon)=>{
                    icon.classList.contains(`${item.dataset.category}`) ?
                        (()=>{
                            icon.style.display = "flex";
                        })()
                        :
                        (()=>{
                            icon.style.display = "none";
                        })()
                    })
                })()
            
            
            
            setTimeout(()=>{
                const categoryBox = document.getElementsByClassName("category-box")[0];
                categoryBox.style.display = "none"
            },50)
        })
    })
}

const openCategory = ()=>{
    const content = document.getElementsByClassName("search-area")[0];
    const categoryBox = document.getElementsByClassName("category-box")[0];
    
    const isCategoryOpen = ()=>{
        const categoryBox = document.getElementsByClassName("category-box")[0];
        const result = categoryBox ? true : false;
        
        return result;
    }
    isCategoryOpen() ? (()=>{
        categoryBox.style.display == "none" ?
            (()=>{
                categoryBox.style.display = "block"
            })()
            :
            (()=>{
                categoryBox.style.display = "none"
            })()
    })()
    :
    (()=>{
         content.insertAdjacentHTML("afterbegin",category())
        addEventToCategory()
    })()
}

const addEventToSearchArea = ()=>{
    const searchByCategoryBox = document.getElementsByClassName("search-by-category")[0];
    searchByCategoryBox.addEventListener("click",openCategory)
}

const showSmallLoadingLing = ()=>{
    const contentBox = document.getElementsByClassName("content-box")[0]
    const loadingLing = '<div class="lds-dual-ring"></div>'
    
    contentBox.insertAdjacentHTML("afterbegin",loadingLing)
}


const init = async function(){
    addEventToSearchArea(); // 검색바에 이벤트 달아주기
    joinedPartyLoad();    //로그인 되어있으면 내 파티 불러온다
    addEventToPartyBoxButton();    //이벤트 추가
    const map = await drawMap();    //지도 그리기
    addEventToMap(map);    //지도에 이벤트 추가
    const locationNameAtInit = getLocationNameOfCurrentMiddleCoord(map.center._lat,map.center._lng); //현재 위치가 어딘지 알아내기
    setLocationNameToMap(locationNameAtInit);    //지도에 이름(위치명) 달아주기
    const partyList = await getPartiesByLocation(locationNameAtInit)    //현재 위치기반 파티 불러오기
    const markers = showPinsOfParties(partyList, map)    //불러온 파티 지도에 표시하기
    addEventToMarkers(markers)
    finishLoader();    //로딩바 끄기
}

init();

