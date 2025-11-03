const apiKey = '3f675bfc718c48c4e2d6c903dfe3ea3c';

const locationInput = document.getElementById('locationInput');
const weatherButton = document.getElementById('weatherButton');
const resultsContainer = document.getElementById('resultsContainer');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');

weatherButton.addEventListener('click', () => {
    const location = locationInput.value;

    if (!location) {
        alert('Proszę wprowadzić nazwę miejscowości.');
        return;
    }

    currentWeatherDiv.innerHTML = 'Ładowanie...';
    forecastDiv.innerHTML = 'Ładowanie...';
    resultsContainer.style.display = 'block';

    getCurrentWeather(location);
    getForecast(location);
});

function getCurrentWeather(location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=pl`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
        if (this.status === 200) {
            const response = JSON.parse(this.responseText);
            console.log('Odpowiedź z Current Weather (XHR):', response);
            displayCurrentWeather(response);
        } else {
            console.error('Błąd Current Weather (XHR):', this.status, this.statusText);
            currentWeatherDiv.innerHTML = `Nie udało się pobrać danych (Błąd: ${this.status}).`;
        }
    };

    xhr.onerror = function() {
        console.error('Błąd sieci (XHR)');
        currentWeatherDiv.innerHTML = 'Błąd sieci.';
    };

    xhr.send();
}

function getForecast(location) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=pl`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Odpowiedź z 5-day Forecast (Fetch):', data);
            displayForecast(data);
        })
        .catch(error => {
            console.error('Błąd 5-day Forecast (Fetch):', error);
            forecastDiv.innerHTML = `Nie udało się pobrać danych (${error.message}).`;
        });
}

function displayCurrentWeather(data) {
    const temp = data.main.temp;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    currentWeatherDiv.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="ikona pogody">
        <p><strong>Temperatura:</strong> ${temp.toFixed(1)} °C</p>
        <p><strong>Warunki:</strong> ${description}</p>
    `;
}

function displayForecast(data) {
    const dailyForecasts = data.list.filter(item => {
        return item.dt_txt.includes("12:00:00");
    });

    let output = '';
    if (dailyForecasts.length === 0) {
        if (data.list.length > 0) {
            output = "Nie znaleziono prognoz na 12:00. Pokazuję najbliższe 3-godzinne rekordy:<br>";
            for(let i=0; i < data.list.length; i += 8) {
                output += renderForecastItem(data.list[i]);
            }
        } else {
            output = "Brak danych prognostycznych.";
        }
    } else {
        dailyForecasts.forEach(item => {
            output += renderForecastItem(item);
        });
    }

    forecastDiv.innerHTML = output;
}

function renderForecastItem(item) {
    const date = new Date(item.dt * 1000);
    const temp = item.main.temp;
    const description = item.weather[0].description;
    const icon = item.weather[0].icon;

    return `
        <div class="forecast-item">
            <strong>${date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'numeric' })}</strong>
            (${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })})
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="ikona" style="vertical-align: middle; width: 40px;">
            <span>${temp.toFixed(1)} °C, ${description}</span>
        </div>
    `;
}