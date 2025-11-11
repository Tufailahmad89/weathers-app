const API_URL = "https://api.open-meteo.com/v1/forecast";
let map, marker;

document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");
  const locationBtn = document.getElementById("locationBtn");
  const locationEl = document.getElementById("location");
  const dateTimeEl = document.getElementById("dateTime");
  const temperatureEl = document.getElementById("temperature");
  const descriptionEl = document.getElementById("description");
  const weatherIconEl = document.getElementById("weatherIcon");
  const feelsLikeEl = document.getElementById("feelsLike");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("windSpeed");
  const loadingEl = document.getElementById("loading");
  const errorMessageEl = document.getElementById("errorMessage");

  const defaultCity = "New Delhi";
  getWeatherData(defaultCity);

  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
  });

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) getWeatherData(city);
    }
  });

  locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const weather = await fetchWeatherData(latitude, longitude);
        updateWeatherUI("Your Location", weather, latitude, longitude);
      });
    }
  });

  async function getWeatherData(city) {
    loadingEl.style.display = "block";
    errorMessageEl.textContent = "";

    try {
      const coordinates = await getCoordinates(city);
      const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
      updateWeatherUI(coordinates.name || city, weatherData, coordinates.lat, coordinates.lon);
    } catch (error) {
      errorMessageEl.textContent = "City not found or weather data unavailable.";
    } finally {
      loadingEl.style.display = "none";
    }
  }

  // ✅ Geocoding (English only)
  async function getCoordinates(city) {
    const normalized = city
      .replace(/\s+/, " ")
      .replace(/garh$/i, "garh")
      .replace(/gh$/i, "garh")
      .replace(/shohrath/i, "shohrat")
      .trim();

    const variations = [
      normalized,
      `${normalized}, India`,
      `${normalized} India`,
      normalized.replace(/\s+/g, ""),
    ];

    for (let query of variations) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1&accept-language=en`
      );
      const data = await response.json();
      if (data && data.length)
        return {
          lat: data[0].lat,
          lon: data[0].lon,
          // ✅ Remove non-English characters
          name: data[0].display_name
            .split(",")[0]
            .replace(/[^\x00-\x7F]/g, "")
            .trim(),
        };
    }

    throw new Error("City not found");
  }

  async function fetchWeatherData(lat, lon) {
    const url = `${API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await fetch(url);
    return await response.json();
  }

  function mapWeatherCodeToText(code) {
    const mapping = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime Fog",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Dense Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      95: "Thunderstorm",
      99: "Thunderstorm with Hail",
    };
    return mapping[code] || "Unknown";
  }

  function updateWeatherUI(city, data, lat, lon) {
    const current = data.current;
    if (!current) return;

    const temp = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);
    const weatherText = mapWeatherCodeToText(current.weather_code);

    locationEl.textContent = city;
    dateTimeEl.textContent = new Date().toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    temperatureEl.textContent = `${Math.round(temp)}°C`;
    feelsLikeEl.textContent = `${Math.round(feelsLike)}°C`;
    humidityEl.textContent = `${Math.round(humidity)}%`;
    windSpeedEl.textContent = `${windSpeed} km/h`;
    descriptionEl.textContent = weatherText;

    const weatherMain = weatherText.toLowerCase();
    if (weatherMain.includes("rain"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
    else if (weatherMain.includes("cloud"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/414/414825.png";
    else if (weatherMain.includes("clear"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    else if (weatherMain.includes("snow"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/2315/2315309.png";
    else if (weatherMain.includes("thunder"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/1779/1779940.png";
    else if (weatherMain.includes("fog"))
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
    else
      weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/4052/4052984.png";

    weatherIconEl.alt = weatherMain;

    if (!map) {
      map = L.map("map").setView([lat, lon], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      marker = L.marker([lat, lon]).addTo(map);
    } else {
      map.setView([lat, lon], 11);
      marker.setLatLng([lat, lon]);
    }
  }
});
