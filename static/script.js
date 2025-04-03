document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("cityInput")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        getWeather();
      }
    });

  // Tải lại lịch sử tìm kiếm
  loadHistory();

  // Tự động lấy vị trí hiện tại
  getCurrentLocation();
});

function getWeather(cityName = null) {
  const city = cityName || document.getElementById("cityInput").value.trim();
  const errorEl = document.getElementById("error");

  if (!city) {
    errorEl.textContent = "Vui lòng nhập tên thành phố!";
    errorEl.style.display = "block";
    return;
  }

  errorEl.style.display = "none";

  fetch(`/weather?city=${city}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        errorEl.textContent = data.error;
        errorEl.style.display = "block";
        return;
      }

      document.getElementById("cityName").textContent = `🌆 ${data.city}`;
      document.getElementById(
        "temperature"
      ).textContent = `🌡️ Nhiệt độ: ${data.temperature}°C`;
      document.getElementById(
        "feels_like"
      ).textContent = `🌡️ Cảm giác như: ${data.feels_like}°C`;
      document.getElementById(
        "humidity"
      ).textContent = `💧 Độ ẩm: ${data.humidity}%`;
      document.getElementById(
        "pressure"
      ).textContent = `🔽 Áp suất: ${data.pressure} hPa`;
      document.getElementById(
        "wind_speed"
      ).textContent = `🌬️ Gió: ${data.wind_speed} m/s`;
      document.getElementById(
        "description"
      ).textContent = `📌 ${data.description}`;

      const weatherIcon = document.getElementById("weatherIcon");

      addToHistory(data.city);
    })
    .catch((error) => {
      errorEl.textContent = "Lỗi khi lấy dữ liệu!";
      errorEl.style.display = "block";
    });
}

// Lấy vị trí hiện tại của người dùng
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ce75a21f9c503e5d4617a91f93fea050&units=metric&lang=vi`
      )
        .then((response) => response.json())
        .then((data) => {
          getWeather(data.name);
        });
    });
  }
}
// 🔹 Lưu lịch sử vào localStorage
function addToHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  loadHistory();
}

// // Lưu lịch sử tìm kiếm vào giao diện
// function loadToHistory(city) {
//   const historyList = document.getElementById("historyList");
//   const listItem = document.createElement("li");
//   listItem.textContent = city;
//   listItem.onclick = () => getWeather(city);
//   historyList.appendChild(listItem);
// }

// Load lịch sử khi mở trang
// function loadHistory() {
//   fetch("/")
//     .then((response) => response.text())
//     .then(() => {
//       console.log("Lịch sử tải thành công!");
//     });

// 🔹 Hiển thị lịch sử khi mở trang
function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = ""; // Xóa danh sách cũ để tránh trùng lặp

  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  history.forEach(city => {
    const listItem = document.createElement("li");
    listItem.textContent = city;
    listItem.onclick = () => getWeather(city);
    historyList.appendChild(listItem);
  });
}
