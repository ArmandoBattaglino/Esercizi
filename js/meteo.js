const currentDayContainer = document.querySelector(".top");
const nextDaysContainer = document.querySelector("ul");

// Recuperiamo la posizione dell'utente grazie al metodo getCurrentPosition()
// @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError);

/**
 * Callback che viene chiamata quando l'utente conferma di voler essere geolocalizzato.
 * @param {Object} position Posizione dell'utente al momento del caricamento della pagina.
 */
function onPositionSuccess(position) {
  init(position.coords.latitude, position.coords.longitude);
}

/**
 * Callback che viene chiamata quando l'utente nega la geolocalizzazione.
 * @param {Object} Informazioni sull'errore verificatosi.
 */
function onPositionError(error) {
  console.error(`Errore: ${error.code} - ${error.message}`);
}

/**
 * Inizializza l'applicazione recuperando le informazioni metereologiche dalle
 * API di Open Weather Map.
 *
 * @param {Number} lat Latitudine dell'utente
 * @param {Number} lon Longitudine dell'utente
 * @returns void
 */
async function init(lat, lon) {
  const apiKey = "cced6d443fe8139085abb9d0c528a0a3"; // API Key fornita da Open Weather Map https://home.openweathermap.org/api_keys

  const forecastEndpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`; // Endpoint di Open Weather Map per recuperare i dati meteo correnti e dei prossimi 7 giorni https://openweathermap.org/api/one-call-api

  // const geoEndpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&appid=${apiKey}`; // Endpoint per Geocoding

  const geoEndpoint = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`; // Endpoint per Geocoding

  const currentLocationWeather = await getWeatherInfo(forecastEndpoint);
  const currentLocationName = await getWeatherInfo(geoEndpoint);

  showTodayWeather(currentLocationWeather.current);
  showNextDaysWeather(currentLocationWeather.daily);
  showLocationName(currentLocationName);

}

async function getWeatherInfo(endpoint) {

  const response = await fetch(endpoint); // Al posto di usare then, diciamo di voler aspettare l'esito della promise prima di proseguire.

  if (response.status !== 200) { // Controllo che la risorsa è stata recuperata con successo.
    console.error("Spiacente! Impossibile recuperare il meteo per la posizione corrente");
    return;
  }

  const weatherInfo = await response.json(); // Convertiamo il corpo della risorsa in JSON così da poter utilizzare le informazioni per poterle renderizzare in pagina, mostrando all'utente il meteo per la sua zona.

  return weatherInfo;
}

// Mostra il tempo di Oggi
// Inserisco il tempo di oggi nella sezione Top

function showZero(dateFormat = Number) {
  let numToString = [];

  if (dateFormat < 10) {
    numToString[0] = "0" + dateFormat.toString();
  } else {
    numToString[0] = dateFormat;
  }

  return numToString[0];
}

function showTodayWeather(todayWeather) {
  const dateCurrentDay = new Date((todayWeather.dt) * 1000);

  let showZeroHours = showZero(dateCurrentDay.getHours());
  let showZeroMinutes = showZero(dateCurrentDay.getMinutes());
  let showZeroSeconds = showZero(dateCurrentDay.getSeconds());

  currentDayContainer.innerHTML = `
    <div class="left-info">
      <div class="current-icon">
        <img src="http://openweathermap.org/img/w/${todayWeather.weather[0].icon}.png">
      </div>
      <p class="current-temperature">${Math.round(todayWeather.temp - 273.15)} °C</p>
    </div>

    <div class="right-info">
      <div class="current-position"></div>
      <div class="current-day">
        <span class="name">${dateCurrentDay.toLocaleDateString("en-US", {weekday:"short"})}</span>
        <span class="hour">${showZeroHours}:${showZeroMinutes}</span>
      </div>
      <div class="current-status">${todayWeather.weather[0].main}</div>
    </div>
    `;
}

// Mostra il tempo dei prossimi giorni
// Aggiungo attraverso la funzione delle Liste nella Ul dentro la sezine Bottom
function showNextDaysWeather(dailyForecast) {

  // Inserisco le liste all'interno dell'Ul
  nextDaysContainer.innerHTML = dailyForecast.map((day, i) => {
    while (i > 0) {
      const dateNameNextDays = new Date((day.dt)*1000);
      return `
        <li class="weekday-box">
          <p class="day-name">${dateNameNextDays.toLocaleDateString("en-US", {weekday:"short"})}</p>
          <div class="day-icon">
            <img id="wicon" src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather Icon">
          </div>
          <p class="day-temperature">${Math.floor(day.temp.day - 273.15)} °C</p>
        </li>
        `
    }
  }).join("");
}

function showLocationName(position) {
  const currentCity = document.querySelector(".current-position")
  currentCity.innerHTML = position[0].name;
}
