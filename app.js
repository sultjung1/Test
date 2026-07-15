/*
  app.js
  이 파일은 선수 데이터, 날씨 데이터, 버튼 클릭, 라인업 검증 같은 동작을 담당합니다.
*/

// 실제 API 연동 시 이 부분을 교체하면 됩니다.
// GitHub Pages는 정적 사이트이므로 API 키가 필요한 서비스는 키 노출 문제가 생길 수 있습니다.
// 교육용 1차 버전에서는 샘플 날씨 데이터를 사용합니다.
let weatherData = {
  location: "비스마야",
  time: "날씨 불러오는 중",
  condition: "-",
  temperature: "-",
  rainChance: "-",
  wind: "-"
};

const weatherCodeText = {
  0: "맑음",
  1: "대체로 맑음",
  2: "부분적으로 흐림",
  3: "흐림",
  45: "안개",
  48: "서리 안개",
  51: "약한 이슬비",
  53: "이슬비",
  55: "강한 이슬비",
  61: "약한 비",
  63: "비",
  65: "강한 비",
  80: "소나기",
  81: "소나기",
  82: "강한 소나기",
  95: "뇌우"
};

async function loadWeather() {
  // 아래 좌표는 예시입니다.
  // 실제 야구장 위치의 위도·경도로 바꾸는 것이 가장 정확합니다.
  const latitude = 33.14;
  const longitude = 44.55;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
    `&timezone=Asia%2FBaghdad` +
    `&forecast_days=16`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`날씨 API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 예보자료 중 가장 가까운 금요일 오전 9시를 찾습니다.
    const fridayIndex = data.hourly.time.findIndex((time) => {
      const [date, hour] = time.split("T");
      const day = new Date(`${date}T00:00:00Z`).getUTCDay();

      return day === 5 && hour === "09:00";
    });

    if (fridayIndex === -1) {
      throw new Error("금요일 오전 예보를 찾지 못했습니다.");
    }

    const forecastTime = data.hourly.time[fridayIndex];
    const weatherCode = data.hourly.weather_code[fridayIndex];

    weatherData = {
      location: "Bismayah, Iraq",
      time: `${forecastTime.substring(5, 10).replace("-", "/")} 금요일 09:00`,
      condition: weatherCodeText[weatherCode] || "확인 필요",
      temperature:
        `${Math.round(data.hourly.temperature_2m[fridayIndex])}℃`,
      rainChance:
        `${data.hourly.precipitation_probability[fridayIndex] ?? 0}%`,
      wind:
        `${Math.round(data.hourly.wind_speed_10m[fridayIndex])}km/h`
    };

    renderWeather();
  } catch (error) {
    console.error(error);

    weatherData = {
      location: "비스마야",
      time: "조회 실패",
      condition: "날씨 정보를 불러오지 못했습니다.",
      temperature: "-",
      rainChance: "-",
      wind: "-"
    };

    renderWeather();
  }
}

// 포지션 목록을 수정하려면 이 배열을 바꾸면 됩니다.
const positions = [
  "투수",
  "포수",
  "1루수",
  "2루수",
  "3루수",
  "유격수",
  "좌익수",
  "중견수",
  "우익수",
  "지명타자",
  "후보"
];

// 팀원 이름과 상태를 수정하려면 이 배열을 바꾸면 됩니다.
// team 값은 home 또는 away를 사용합니다.
const samplePlayers = [
  { id: 1, team: "home", name: "김민준", defaultPosition: "투수", available: true, status: "정상", note: "선발 가능" },
  { id: 2, team: "home", name: "이준호", defaultPosition: "포수", available: true, status: "정상", note: "포수 우선" },
  { id: 3, team: "home", name: "박서준", defaultPosition: "1루수", available: true, status: "정상", note: "" },
  { id: 4, team: "home", name: "최도윤", defaultPosition: "2루수", available: true, status: "정상", note: "" },
  { id: 5, team: "home", name: "정하준", defaultPosition: "3루수", available: true, status: "정상", note: "" },
  { id: 6, team: "home", name: "강지훈", defaultPosition: "유격수", available: true, status: "정상", note: "내야 가능" },
  { id: 7, team: "home", name: "조현우", defaultPosition: "좌익수", available: true, status: "정상", note: "" },
  { id: 8, team: "home", name: "윤태민", defaultPosition: "중견수", available: true, status: "정상", note: "" },
  { id: 9, team: "home", name: "오시완", defaultPosition: "우익수", available: true, status: "정상", note: "" },
  { id: 10, team: "home", name: "한재원", defaultPosition: "지명타자", available: true, status: "정상", note: "장타력" },
  { id: 11, team: "home", name: "송유찬", defaultPosition: "후보", available: false, status: "휴가", note: "이번 주 휴가" },
  { id: 12, team: "home", name: "임도현", defaultPosition: "후보", available: false, status: "부상", note: "발목 통증" },

  { id: 101, team: "away", name: "알리", defaultPosition: "투수", available: true, status: "정상", note: "" },
  { id: 102, team: "away", name: "하산", defaultPosition: "포수", available: true, status: "정상", note: "" },
  { id: 103, team: "away", name: "무스타파", defaultPosition: "1루수", available: true, status: "정상", note: "" },
  { id: 104, team: "away", name: "오마르", defaultPosition: "2루수", available: true, status: "정상", note: "" },
  { id: 105, team: "away", name: "아흐메드", defaultPosition: "3루수", available: true, status: "정상", note: "" },
  { id: 106, team: "away", name: "카림", defaultPosition: "유격수", available: true, status: "정상", note: "" },
  { id: 107, team: "away", name: "마흐무드", defaultPosition: "좌익수", available: true, status: "정상", note: "" },
  { id: 108, team: "away", name: "유세프", defaultPosition: "중견수", available: true, status: "정상", note: "" },
  { id: 109, team: "away", name: "압바스", defaultPosition: "우익수", available: true, status: "정상", note: "" },
  { id: 110, team: "away", name: "사미르", defaultPosition: "후보", available: true, status: "정상", note: "후보 가능" },
  { id: 111, team: "away", name: "자이드", defaultPosition: "후보", available: false, status: "불참", note: "개인 일정" }
];

let players = [];
let currentTeam = "home";

// 야구장 중앙 그래픽에 표시할 팀입니다.
// 기본값은 우리 팀이며, 버튼을 누르면 상대 팀 기준으로도 볼 수 있습니다.
let fieldViewTeam = "home";

let confirmedLineups = {
  home: [],
  away: []
};

const teamLabels = {
  home: "우리 팀",
  away: "상대 팀"
};

const fieldPositionIds = {
  "투수": "pos-투수",
  "포수": "pos-포수",
  "1루수": "pos-1루수",
  "2루수": "pos-2루수",
  "3루수": "pos-3루수",
  "유격수": "pos-유격수",
  "좌익수": "pos-좌익수",
  "중견수": "pos-중견수",
  "우익수": "pos-우익수",
  "지명타자": "pos-지명타자"
};

document.addEventListener("DOMContentLoaded", () => {
  loadSampleData();

  document.getElementById("loadSampleBtn").addEventListener("click", () => {
    loadSampleData();
    showMessage("샘플 데이터를 다시 불러왔습니다.", "success");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resetLineups();
  });

  document.getElementById("confirmBtn").addEventListener("click", () => {
    confirmLineup();
  });

  document.querySelectorAll(".field-toggle-btn").forEach((button) => {
    button.addEventListener("click", () => {
      fieldViewTeam = button.dataset.fieldTeam;
      renderFieldToggle();
      renderField();
      showMessage(`야구장 표시 기준을 ${teamLabels[fieldViewTeam]}으로 변경했습니다.`, "info");
    });
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      currentTeam = button.dataset.team;
      renderTabs();
      renderPlayerTable();
      showMessage(`${teamLabels[currentTeam]} 선수 설정 화면입니다.`, "info");
    });
  });
});

function loadSampleData() {
  // 원본 샘플 데이터를 복사해서 사용합니다.
  // 이렇게 하면 초기화할 때 원본 데이터가 깨지지 않습니다.
  players = samplePlayers.map((player) => ({
    ...player,
    battingOrder: "",
    selectedPosition: player.available ? player.defaultPosition : ""
  }));

  confirmedLineups = {
    home: [],
    away: []
  };

  renderWeather();
  renderTabs();
  renderFieldToggle();
  renderPlayerTable();
  renderLineups();
  renderField();
}

function resetLineups() {
  players = players.map((player) => ({
    ...player,
    battingOrder: "",
    selectedPosition: "",
    available: player.status === "정상"
  }));

  confirmedLineups = {
    home: [],
    away: []
  };

  renderFieldToggle();
  renderPlayerTable();
  renderLineups();
  renderField();
  showMessage("라인업을 초기화했습니다. 정상 상태 선수만 다시 체크되었습니다.", "success");
}

function renderWeather() {
  const weatherBox = document.getElementById("weatherBox");
  weatherBox.innerHTML = `
    <div class="weather-item">
      <span class="weather-label">지역</span>
      <strong class="weather-value">${weatherData.location}</strong>
    </div>
    <div class="weather-item">
      <span class="weather-label">날씨</span>
      <strong class="weather-value">${weatherData.condition}</strong>
    </div>
    <div class="weather-item">
      <span class="weather-label">기온</span>
      <strong class="weather-value">${weatherData.temperature}</strong>
    </div>
    <div class="weather-item">
      <span class="weather-label">강수 / 바람</span>
      <strong class="weather-value">${weatherData.rainChance} · ${weatherData.wind}</strong>
    </div>
  `;
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.team === currentTeam);
  });
}

function renderFieldToggle() {
  document.querySelectorAll(".field-toggle-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.fieldTeam === fieldViewTeam);
  });

  const fieldTeamText = document.getElementById("fieldTeamText");
  if (fieldTeamText) {
    fieldTeamText.textContent = `현재 ${teamLabels[fieldViewTeam]} 기준으로 표시 중입니다.`;
  }
}

function renderPlayerTable() {
  const tbody = document.getElementById("playerTableBody");
  const teamPlayers = players.filter((player) => player.team === currentTeam);

  tbody.innerHTML = teamPlayers.map((player) => {
    const unavailable = player.status !== "정상";
    return `
      <tr class="${unavailable ? "unavailable" : ""}">
        <td>
          <input
            type="checkbox"
            ${player.available ? "checked" : ""}
            aria-label="${player.name} 출전 가능 여부"
            onchange="updateAvailability(${player.id}, this.checked)"
          />
        </td>
        <td><strong>${player.name}</strong></td>
        <td>
          <span class="status-badge status-${player.status}">
            ${player.status}
          </span>
        </td>
        <td>${player.defaultPosition}</td>
        <td>
          <select onchange="updateBattingOrder(${player.id}, this.value)">
            <option value="">선택</option>
            ${makeOrderOptions(player.battingOrder)}
          </select>
        </td>
        <td>
          <select onchange="updatePosition(${player.id}, this.value)">
            <option value="">선택</option>
            ${makePositionOptions(player.selectedPosition)}
          </select>
        </td>
        <td class="note">
          ${unavailable ? "출전 불가 · " : ""}${player.note || "-"}
        </td>
      </tr>
    `;
  }).join("");
}

function makeOrderOptions(selectedOrder) {
  let html = "";
  for (let order = 1; order <= 9; order++) {
    html += `<option value="${order}" ${String(selectedOrder) === String(order) ? "selected" : ""}>${order}번</option>`;
  }
  return html;
}

function makePositionOptions(selectedPosition) {
  return positions.map((position) => {
    return `<option value="${position}" ${selectedPosition === position ? "selected" : ""}>${position}</option>`;
  }).join("");
}

function updateAvailability(playerId, isAvailable) {
  const player = players.find((item) => item.id === playerId);
  if (!player) return;

  player.available = isAvailable;

  // 체크를 해제하면 타순과 포지션도 비웁니다.
  if (!isAvailable) {
    player.battingOrder = "";
    player.selectedPosition = "";
  } else if (!player.selectedPosition) {
    player.selectedPosition = player.defaultPosition;
  }

  renderPlayerTable();
}

function updateBattingOrder(playerId, order) {
  const player = players.find((item) => item.id === playerId);
  if (!player) return;
  player.battingOrder = order;
}

function updatePosition(playerId, position) {
  const player = players.find((item) => item.id === playerId);
  if (!player) return;
  player.selectedPosition = position;
}

function confirmLineup() {
  const teamPlayers = players.filter((player) => player.team === currentTeam);
  const availablePlayers = teamPlayers.filter((player) => player.available);

  if (availablePlayers.length === 0) {
    showMessage("출전 가능 선수로 체크된 인원이 없습니다.", "error");
    return;
  }

  // 포지션을 선택한 선수만 라인업 확정 대상으로 봅니다.
  const configuredPlayers = availablePlayers.filter((player) => player.selectedPosition);

  if (configuredPlayers.length === 0) {
    showMessage("라인업에 반영할 선수가 없습니다. 포지션을 먼저 선택하세요.", "error");
    return;
  }

  const starters = configuredPlayers.filter((player) => player.selectedPosition !== "후보");
  const candidates = configuredPlayers.filter((player) => player.selectedPosition === "후보");

  const validationMessage = validateLineup(starters);
  if (validationMessage) {
    showMessage(validationMessage, "error");
    return;
  }

  const sortedLineup = [
    ...starters.sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder)),
    ...candidates
  ];

  confirmedLineups[currentTeam] = sortedLineup.map((player) => ({ ...player }));

  renderLineups();
  renderField();

  const starterCount = starters.length;
  if (starterCount < 9) {
    showMessage(`${teamLabels[currentTeam]} 라인업이 확정되었습니다. 단, 선발이 ${starterCount}명이라 9명 미만입니다.`, "warning");
  } else if (starterCount > 9) {
    showMessage(`${teamLabels[currentTeam]} 라인업이 확정되었습니다. 후보를 제외한 선발이 ${starterCount}명입니다. 선발 9명 기준으로 조정이 필요합니다.`, "warning");
  } else {
    showMessage(`${teamLabels[currentTeam]} 선발 9명 라인업이 정상 확정되었습니다.`, "success");
  }
}

function validateLineup(starters) {
  const orders = starters.map((player) => player.battingOrder).filter(Boolean);
  const positionsOnly = starters.map((player) => player.selectedPosition).filter(Boolean);

  const missingOrder = starters.find((player) => !player.battingOrder);
  if (missingOrder) {
    return `${missingOrder.name} 선수의 타순이 선택되지 않았습니다.`;
  }

  const duplicatedOrder = findDuplicate(orders);
  if (duplicatedOrder) {
    return `${duplicatedOrder}번 타순이 중복 선택되었습니다.`;
  }

  const duplicatedPosition = findDuplicate(positionsOnly);
  if (duplicatedPosition) {
    return `${duplicatedPosition} 포지션이 중복 선택되었습니다. 후보만 여러 명 선택 가능합니다.`;
  }

  return "";
}

function findDuplicate(values) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }

  return "";
}

function renderLineups() {
  renderTeamLineup("home", "homeLineup", "homeCount");
  renderTeamLineup("away", "awayLineup", "awayCount");
}

function renderTeamLineup(team, containerId, countId) {
  const container = document.getElementById(containerId);
  const count = document.getElementById(countId);
  const lineup = confirmedLineups[team] || [];

  const starters = lineup.filter((player) => player.selectedPosition !== "후보");
  const candidates = lineup.filter((player) => player.selectedPosition === "후보");

  count.textContent = `${starters.length}명`;

  if (lineup.length === 0) {
    container.className = "lineup-list empty-state";
    container.textContent = "아직 확정된 라인업이 없습니다.";
    return;
  }

  container.className = "lineup-list";

  const starterHtml = starters.map((player) => `
    <div class="lineup-row">
      <div class="order-pill">${player.battingOrder}</div>
      <div>
        <div class="player-name">${player.name}</div>
        <div class="player-meta">
          <span>${player.selectedPosition}</span>
          <span>·</span>
          <span>${player.status}</span>
        </div>
      </div>
    </div>
  `).join("");

  const candidateHtml = candidates.length > 0
    ? `
      <div class="candidate-title">후보</div>
      ${candidates.map((player) => `
        <div class="lineup-row">
          <div class="order-pill">후</div>
          <div>
            <div class="player-name">${player.name}</div>
            <div class="player-meta">
              <span>${player.selectedPosition}</span>
              <span>·</span>
              <span>${player.status}</span>
            </div>
          </div>
        </div>
      `).join("")}
    `
    : "";

  container.innerHTML = starterHtml + candidateHtml;
}

function renderField() {
  // 야구장 중앙 그래픽은 fieldViewTeam 값에 따라 우리 팀 또는 상대 팀 기준으로 표시합니다.
  const lineup = confirmedLineups[fieldViewTeam] || [];

  Object.entries(fieldPositionIds).forEach(([position, elementId]) => {
    const element = document.getElementById(elementId);
    const player = lineup.find((item) => item.selectedPosition === position);
    const shortLabel = position === "지명타자" ? "DH" : position;

    element.innerHTML = `${shortLabel}<br><strong>${player ? player.name : "-"}</strong>`;
  });
}

function showMessage(text, type = "info") {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}
