const API_KEY =
  "";
const itemsPerPage = 5; // 페이지당 항목 수
let currentPage = 1; // 현재 페이지 번호
let displayedMountainNames = new Set(); // 이미 표시된 산 이름을 추적하기 위한 Set

// 산 데이터를 가져오는 함수
function fetchMountains(page) {
  const apiUrl = `http://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoOpenAPI2?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${itemsPerPage}&_type=json`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text(); // JSON 대신 텍스트로 응답을 먼저 받음
    })
    .then((text) => {
      try {
        const data = JSON.parse(text); // 텍스트를 JSON으로 파싱
        const items = data.response.body.items.item;
        console.log("Fetched mountains:", items); // 데이터 확인용 로그
        displayMountains(items);
      } catch (error) {
        console.error("Error parsing JSON:", error, "Response Text:", text);
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// 산 데이터를 화면에 표시하는 함수
function displayMountains(mountains) {
  const mountainList = document.querySelector(".main-mountain-list");
  mountainList.innerHTML = ""; // 초기화
  const promises = mountains.map((mountain) => {
    // 동일한 산 이름을 무시
    if (displayedMountainNames.has(mountain.mntiname)) {
      return Promise.resolve();
    }
    displayedMountainNames.add(mountain.mntiname);

    // 스켈레톤 로딩 추가
    const listItem = document.createElement("div");
    listItem.className = "main-mountain-list-item skeleton";
    mountainList.appendChild(listItem);

    return fetchImage(mountain.mntilistno).then((imageUrl) => {
      console.log("Mountain data:", mountain); // 산 데이터 확인용 로그
      if (imageUrl) {
        listItem.className = "main-mountain-list-item";
        listItem.style.backgroundImage = `url(${imageUrl})`;
        listItem.innerHTML = `
                    <div class="main-mountain-list-overlay">
                        <p>산 부제: ${mountain.mntitop}</p> <!-- 산 부제 -->
                        <p>지역: ${mountain.mntiadd}</p> <!-- 지역명 -->
                        <p>높이: ${mountain.mntihigh}m</p> <!-- 산 높이 -->
                    </div>
                    
                        <h2>${mountain.mntiname}</h2> <!-- 산 이름 -->
      
                `;
      } else {
        listItem.classList.remove("skeleton"); // 이미지가 없을 경우 스켈레톤 클래스 제거
      }
    });
  });

  Promise.all(promises).catch((error) =>
    console.error("Error displaying mountains:", error)
  );
}

// 산 이미지 데이터를 가져오는 함수
function fetchImage(mntilistno) {
  return new Promise((resolve, reject) => {
    const imageApiUrl = `http://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoImgOpenAPI2?serviceKey=${API_KEY}&mntiListNo=${mntilistno}&_type=json`;

    fetch(imageApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const items = data.response.body.items.item;
        if (items && items.length > 0) {
          const imageUrl = `http://www.forest.go.kr/images/data/down/mountain/${items[0].imgfilename}`;
          resolve(imageUrl);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        resolve(null);
        console.error("Error fetching image:", error);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMountains(currentPage);

  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchMountains(currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    currentPage++;
    fetchMountains(currentPage);
  });
});
