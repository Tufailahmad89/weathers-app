 document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
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

            // Default city for initial load
            const defaultCity = 'New Delhi';
            let currentCity = defaultCity;

            // Initialize with default city
            getWeatherData(defaultCity);

            // Event listeners
            searchBtn.addEventListener('click', () => {
                const city = cityInput.value.trim();
                if (city) {
                    currentCity = city;
                    getWeatherData(city);
                }
            });

            // cityInput.addEventListener('keypress', (e) => {
            //     if (e.key === 'Enter') {
            //         const city = cityInput.value.trim();
            //         if (city) {
            //             currentCity = city;
            //             getWeatherData(city);
            //         }
            //     }
            // });

            // Function to get weather data
            async function getWeatherData(city) {
                // Show loading state
                loadingEl.style.display = 'block';
                errorMessageEl.style.display = 'none';
                
                try {
                    // Using a free weather API (OpenWeatherMap)
                    // Note: In a real application, you would use your own API key
                    // For demo purposes, we'll simulate data since we can't make actual API calls
                    const weatherData = await fetchWeatherData(city);
                    
                    // Update the UI with weather data
                    updateWeatherUI(weatherData);
                    
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                    loadingEl.style.display = 'none';
                    errorMessageEl.style.display = 'block';
                }
            }

            // Simulated weather data function (since we can't make actual API calls)
            async function fetchWeatherData(city) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock weather data for demonstration
                const mockWeatherData = {
                    name: city,
                    main: {
                        temp: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
                        feels_like: Math.floor(Math.random() * 10) + 5, // Random feels like value
                        humidity: Math.floor(Math.random() * 50) + 30 // Random humidity between 30-80%
                    },
                    weather: [{
                        main: ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow'][Math.floor(Math.random() * 6)],
                        description: ['clear sky', 'few clouds', 'light rain', 'drizzle', 'thunderstorm', 'snow'][Math.floor(Math.random() * 6)],
                        icon: ['01d', '02d', '10d', '09d', '11d', '13d'][Math.floor(Math.random() * 6)]
                    }],
                    wind: {
                        speed: Math.floor(Math.random() * 20) + 5 // Random wind speed between 5-25 km/h
                    }
                };
                
                return mockWeatherData;
            }

            // Function to update UI with weather data
            function updateWeatherUI(data) {
                // Hide loading and error states
                loadingEl.style.display = 'none';
                errorMessageEl.style.display = 'none';
                
                // Update location
                locationEl.textContent = data.name;
                
                // Update date and time
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
                
                // Update temperature
                temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
                
                // Update description
                descriptionEl.textContent = data.weather[0].description;
                
                // Update weather icon
                const iconCode = data.weather[0].icon;
                weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                
                // Update additional details
                feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
                humidityEl.textContent = `${data.main.humidity}%`;
                windSpeedEl.textContent = `${data.wind.speed} km/h`;
                
                // Apply weather class for styling
                const weatherMain = data.weather[0].main.toLowerCase();
                document.querySelector('.container').className = 'container ' + weatherMain;
                
                // Set appropriate icon color based on weather condition
                if (weatherMain === 'clear' || weatherMain === 'sun') {
                    weatherIconEl.style.color = '#feca57';
                } else if (weatherMain === 'clouds') {
                    weatherIconEl.style.color = '#dfe6e9';
                } else if (weatherMain === 'rain' || weatherMain === 'drizzle') {
                    weatherIconEl.style.color = '#b2bec3';
                } else if (weatherMain === 'snow') {
                    weatherIconEl.style.color = '#e8f4fd';
                } else if (weatherMain === 'thunderstorm') {
                    weatherIconEl.style.color = '#6c5ce7';
                }
            }
        });