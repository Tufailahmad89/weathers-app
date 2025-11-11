// ✅ Open-Meteo Weather API (No Key Needed)
const API_URL = 'https://api.open-meteo.com/v1/forecast';

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const locationEl = document.getElementById('location');
  const dateTimeEl = document.getElementById('dateTime');
  const temperatureEl = document.getElementById('temperature');
  const descriptionEl = document.getElementById('description');
  const weatherIconEl = document.getElementById('weatherIcon');
  const feelsLikeEl = document.getElementById('feelsLike');
  const humidityEl = document.getElementById('humidity');
  const windSpeedEl = document.getElementById('windSpeed');
  const loadingEl = document.getElementById('loading');
  const errorMessageEl = document.getElementById('errorMessage');

  const defaultCity = 'New Delhi';
  getWeatherData(defaultCity);

  // Event Listeners
  searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
  });

  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = cityInput.value.trim();
      if (city) getWeatherData(city);
    }
  });

  // ✅ Main Weather Data Function
  async function getWeatherData(city) {
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorMessageEl) {
      errorMessageEl.style.display = 'none';
      errorMessageEl.textContent = '';
    }

    try {
      const coordinates = await getCoordinates(city);
      if (!coordinates) throw new Error('City not found');

      const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
      updateWeatherUI(city, weatherData);
    } catch (error) {
      console.error(error);
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorMessageEl) {
        errorMessageEl.style.display = 'block';
        errorMessageEl.textContent = error.message || 'Unable to fetch weather data.';
      }
    }
  }

  // ✅ Get Coordinates (Improved for villages)
  async function getCoordinates(city) {
    try {
      // 1st try: City + India (for small places)
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`
      );
      let data = await response.json();

      // 2nd try: plain city if still not found
      if (!data || !data.length) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
        );
        data = await response.json();
      }

      // 3rd try: fallback to Sitapur if not found
      if (!data || !data.length) {
        console.warn(`No coordinates found for ${city}, using Sitapur fallback`);
        return { lat: 27.57, lon: 80.68 };
      }

      return { lat: data[0].lat, lon: data[0].lon };
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      return { lat: 27.57, lon: 80.68 }; // fallback Sitapur
    }
  }

  // ✅ Fetch Weather Data from Open-Meteo
  async function fetchWeatherData(lat, lon) {
    const url = `${API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.current) throw new Error('Weather data unavailable');
    return data;
  }

  // ✅ Map Weather Codes to Text
  function mapWeatherCodeToText(code) {
    const mapping = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Rime Fog',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Dense Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      95: 'Thunderstorm',
      99: 'Thunderstorm with Hail'
    };
    return mapping[code] || 'Unknown';
  }

  // ✅ Update the UI
  function updateWeatherUI(city, data) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorMessageEl) errorMessageEl.style.display = 'none';

    const current = data.current;
    if (!current) throw new Error('No weather data found');

    const temp = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);
    const weatherCode = current.weather_code;
    const weatherText = mapWeatherCodeToText(weatherCode);

    // ✅ Update values
    locationEl.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    dateTimeEl.textContent = new Date().toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    temperatureEl.textContent = `${Math.round(temp)}°C`;
    feelsLikeEl.textContent = `${Math.round(feelsLike)}°C`;
    humidityEl.textContent = `${Math.round(humidity)}%`;
    windSpeedEl.textContent = `${windSpeed} km/h`;
    descriptionEl.textContent = weatherText;

    const weatherMain = weatherText.toLowerCase();

    // ✅ Dynamic Icons
    if (weatherIconEl) {
      if (weatherMain.includes('rain')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png';
      } else if (weatherMain.includes('cloud')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/414/414825.png';
      } else if (weatherMain.includes('clear')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/869/869869.png';
      } else if (weatherMain.includes('snow')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/2315/2315309.png';
      } else if (weatherMain.includes('thunder')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/1779/1779940.png';
      } else if (weatherMain.includes('fog')) {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png';
      } else {
        weatherIconEl.src = 'https://cdn-icons-png.flaticon.com/512/4052/4052984.png';
      }
      weatherIconEl.alt = weatherMain;
    }
  }
});
