const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('city');
const weatherResult = document.getElementById('weatherResult');
const locationButton = document.getElementById('locationButton');
const suggestionButtons = document.querySelectorAll('.suggestion');

const weatherCodeLabels = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
};

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
        showMessage('Please enter a city name.');
        return;
    }
    await fetchWeatherForCity(city);
});

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showMessage('Geolocation is not supported by this browser.');
        return;
    }
    weatherResult.innerHTML = '<p class="message">Detecting your location...</p>';
    navigator.geolocation.getCurrentPosition(handlePosition, handleGeoError, { timeout: 10000 });
});

suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => {
        cityInput.value = button.dataset.city;
        fetchWeatherForCity(button.dataset.city);
    });
});

async function handlePosition(position) {
    const { latitude, longitude } = position.coords;
    await fetchWeatherForCoordinates(latitude, longitude);
}

function handleGeoError() {
    showMessage('Unable to access location. Please try again or search manually.');
}

async function fetchWeatherForCity(city) {
    showLoading('Looking up weather for ' + city + '...');

    try {
        const geocodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geocodeData = await geocodeResponse.json();

        if (!geocodeData.results || geocodeData.results.length === 0) {
            showMessage('City not found. Please try a different name.');
            return;
        }

        const place = geocodeData.results[0];
        await fetchWeatherForCoordinates(place.latitude, place.longitude, place);
    } catch (error) {
        showMessage('An error occurred while fetching weather data.');
        console.error(error);
    }
}

async function fetchWeatherForCoordinates(latitude, longitude, place = null) {
    showLoading('Fetching live weather...');

    try {
        const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const forecastData = await forecastResponse.json();

        if (!forecastData.current_weather) {
            showMessage('Unable to retrieve weather at the moment.');
            return;
        }

        if (!place) {
            place = {
                name: forecastData.timezone.replace('_', ' '),
                country: ''
            };
        }

        renderWeather(place, forecastData.current_weather, forecastData.timezone);
    } catch (error) {
        showMessage('An error occurred while fetching weather data.');
        console.error(error);
    }
}

function renderWeather(place, current, timezone) {
    const description = weatherCodeLabels[current.weathercode] || 'Clear weather';
    const icon = getWeatherIcon(current.weathercode);
    const windDirection = formatWindDirection(current.winddirection);
    const localTime = formatTime(current.time, timezone);

    weatherResult.innerHTML = `
        <div class="weather-card">
            <div class="weather-main">
                <div>
                    <div class="weather-value">${Math.round(current.temperature)}°</div>
                    <div class="weather-meta">
                        <span>${description}</span>
                        <span>${place.name}${place.country ? ', ' + place.country : ''}</span>
                    </div>
                </div>
                <div class="condition">
                    <img src="${icon}" alt="${description}" />
                    <p>${description}</p>
                </div>
            </div>

            <div class="weather-flow">
                <div class="details-grid">
                    <div class="detail-item">
                        <span>Temperature</span>
                        <strong>${Math.round(current.temperature)}°C</strong>
                    </div>
                    <div class="detail-item">
                        <span>Wind</span>
                        <strong>${current.windspeed} km/h</strong>
                    </div>
                    <div class="detail-item">
                        <span>Direction</span>
                        <strong>${windDirection}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Local time</span>
                        <strong>${localTime}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getWeatherIcon(code) {
    if (code === 0) return 'https://img.icons8.com/fluency/96/000000/sun.png';
    if (code <= 3) return 'https://img.icons8.com/fluency/96/000000/cloud.png';
    if (code <= 48) return 'https://img.icons8.com/fluency/96/000000/fog.png';
    if (code <= 67) return 'https://img.icons8.com/fluency/96/000000/rain.png';
    if (code <= 86) return 'https://img.icons8.com/fluency/96/000000/snow.png';
    return 'https://img.icons8.com/fluency/96/000000/storm.png';
}

function formatWindDirection(degree) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degree % 360) / 22.5) % 16;
    return directions[index];
}

function formatTime(timeString, timezone) {
    try {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone });
    } catch {
        return timeString;
    }
}

function showLoading(message) {
    weatherResult.innerHTML = `<p class="message">${message}</p>`;
}

function showMessage(message) {
    weatherResult.innerHTML = `<p class="message">${message}</p>`;
}
