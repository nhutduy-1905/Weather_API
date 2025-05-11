document.addEventListener("DOMContentLoaded", function () {
  const cityInput = document.getElementById("cityInput");
  const errorEl = document.getElementById("error");

  if (!cityInput || !errorEl) {
    console.error("Không tìm thấy phần tử DOM cần thiết.");
    return;
  }

  cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      getWeather();
    }
  });

  loadHistory();
});

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[match]);
}

function getWeather(cityName = null) {
  const cityInput = document.getElementById("cityInput");
  const errorEl = document.getElementById("error");
  const weatherBox = document.getElementById("weatherBox");
  const city = cityName || cityInput.value.trim();

  if (!city) {
    errorEl.textContent = "Vui lòng nhập tên thành phố!";
    errorEl.style.display = "block";
    return;
  }

  errorEl.style.display = "none";
  cityInput.disabled = true;

  // Thêm trạng thái tải
  const loadingEl = document.createElement("div");
  loadingEl.textContent = "Đang tải...";
  loadingEl.id = "loading";
  weatherBox.appendChild(loadingEl);

  fetch(`/weather?city=${encodeURIComponent(city)}`)
    .then((response) => response.json())
    .then((data) => {
      cityInput.disabled = false;
      loadingEl.remove();

      if (data.error) {
        errorEl.textContent = data.error;
        errorEl.style.display = "block";
        return;
      }

      // Cập nhật thông tin thời tiết
      document.getElementById("cityName").textContent = `🌆 ${escapeHTML(data.city)}`;
      document.getElementById("temperature").textContent = `🌡️ Nhiệt độ: ${data.temperature}°C`;
      document.getElementById("feels_like").textContent = `🌡️ Cảm giác như: ${data.feels_like}°C`;
      document.getElementById("humidity").textContent = `💧 Độ ẩm: ${data.humidity}%`;
      document.getElementById("pressure").textContent = `🔽 Áp suất: ${data.pressure} hPa`;
      document.getElementById("wind_speed").textContent = `🌬️ Gió: ${data.wind_speed} m/s`;
      document.getElementById("description").textContent = `📌 ${escapeHTML(data.description)}`;

      const weatherIcon = document.getElementById("weatherIcon");
      weatherIcon.src = data.icon || "default-icon.png";
      weatherIcon.style.display = data.icon ? "block" : "none";

      addToHistory(data.city);
    })
    .catch((error) => {
      cityInput.disabled = false;
      loadingEl.remove();
      errorEl.textContent = error.message.includes("Failed to fetch")
        ? "Lỗi kết nối mạng. Vui lòng kiểm tra internet."
        : "Đã xảy ra lỗi khi lấy dữ liệu thời tiết.";
      errorEl.style.display = "block";
      console.error("Fetch error:", error);
    });
}

function getCurrentLocation() {
  const errorEl = document.getElementById("error");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      (error) => {
        errorEl.textContent = "Không thể lấy vị trí hiện tại.";
        errorEl.style.display = "block";
      }
    );
  } else {
    errorEl.textContent = "Trình duyệt không hỗ trợ định vị.";
    errorEl.style.display = "block";
  }
}

function fetchWeatherByCoords(lat, lon) {
  const errorEl = document.getElementById("error");
  const weatherBox = document.getElementById("weatherBox");

  const loadingEl = document.createElement("div");
  loadingEl.textContent = "Đang tải...";
  loadingEl.id = "loading";
  weatherBox.appendChild(loadingEl);

  fetch(`/weather?lat=${lat}&lon=${lon}`)
    .then((response) => response.json())
    .then((data) => {
      loadingEl.remove();
      if (data.error) {
        errorEl.textContent = data.error;
        errorEl.style.display = "block";
        return;
      }

      document.getElementById("cityName").textContent = `🌆 ${escapeHTML(data.city)}`;
      document.getElementById("temperature").textContent = `🌡️ Nhiệt độ: ${data.temperature}°C`;
      document.getElementById("feels_like").textContent = `🌡️ Cảm giác như: ${data.feels_like}°C`;
      document.getElementById("humidity").textContent = `💧 Độ ẩm: ${data.humidity}%`;
      document.getElementById("pressure").textContent = `🔽 Áp suất: ${data.pressure} hPa`;
      document.getElementById("wind_speed").textContent = `🌬️ Gió: ${data.wind_speed} m/s`;
      document.getElementById("description").textContent = `📌 ${escapeHTML(data.description)}`;

      const weatherIcon = document.getElementById("weatherIcon");
      weatherIcon.src = data.icon || "default-icon.png";
      weatherIcon.style.display = data.icon ? "block" : "none";

      addToHistory(data.city);
    })
    .catch((error) => {
      loadingEl.remove();
      errorEl.textContent = "Đã xảy ra lỗi khi lấy dữ liệu thời tiết.";
      errorEl.style.display = "block";
      console.error("Fetch error:", error);
    });
}

function addToHistory(city) {
  let history = JSON.parse(sessionStorage.getItem("searchHistory")) || [];
  const normalizedCity = city.toLowerCase();

  if (!history.some((item) => item.toLowerCase() === normalizedCity)) {
    history.unshift(city);
    history = history.slice(0, 5);
    sessionStorage.setItem("searchHistory", JSON.stringify(history));
  }

  loadHistory();
}

function loadHistory() {
  const historyList = document.getElementById("historyList");
  let history = JSON.parse(sessionStorage.getItem("searchHistory")) || [];

  if (historyList.children.length !== history.length) {
    historyList.innerHTML = "";
    history.forEach((city) => {
      const listItem = document.createElement("li");
      listItem.innerText = city;
      listItem.onclick = () => getWeather(city);
      historyList.appendChild(listItem);
    });
  }
}

// session 