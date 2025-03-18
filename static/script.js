function getWeather() {
  let city = document.getElementById("city").value;
  if (!city) {
    alert("Vui lòng nhập tên thành phố!");
    return;
  }

  fetch(`/weather?city=${city}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        document.getElementById(
          "weather-result"
        ).innerHTML = `<p>${data.error}</p>`;
      } else {
        document.getElementById("weather-result").innerHTML = `
                    <h2>${data.city}</h2>
                    <p>Nhiệt độ: ${data.temperature}°C</p>
                    <p>${data.description}</p>
                    <img src="http://openweathermap.org/img/wn/${data.icon}.png" alt="Icon">
                `;
      }
    })
    .catch((error) => console.log("Lỗi: ", error));
}
