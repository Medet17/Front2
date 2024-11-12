document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'e393f2312ec6bab2770ac7d0b7c1ccae';

  let isC = true;

  const sinput = document.getElementById('city-input');
  const suggetions = document.getElementById('suggestions');
  const searchBtn = document.getElementById('search-btn');
   const geobtn = document.getElementById('location-btn');

  const unitToggleBtn = document.getElementById('unit-toggle-btn');
  const currentWeatherDiv = document.getElementById('current-weather');
  const forecastDiv = document.getElementById('forecast');


  sinput.addEventListener('input', function() {
    const q = sinput.value.trim();
    if (q.length > 2) {
      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
           suggetions.innerHTML = '';
          data.forEach(city => {
             const li = document.createElement('li');
            li.textContent = `${city.name}, ${city.country}`;
             li.addEventListener('click', () => {
               sinput.value = `${city.name}, ${city.country}`;
              suggetions.innerHTML = '';
              getWeatherByCoordinates(city.lat, city.lon);
            });
             suggetions.appendChild(li);
          });
           })
          //  bug h
        .catch(error => console.error('cannot log suggestions :', error));
    } else {
      suggetions.innerHTML = '';
    }
  });


  document.addEventListener('click', function(event) {
    if (!suggetions.contains(event.target) && event.target !== sinput) {
      suggetions.innerHTML = '';
    }
  });


  searchBtn.addEventListener('click', () => {
    const cityName = sinput.value.trim();
    if (cityName) {

       const [city, country] = cityName.split(',');
      getCoordinates(city.trim(), country ? country.trim() : '');
    } else {
      alert('Please enter a city name.');
    }
  });


  geobtn.addEventListener('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
      }, () => {
        alert('Unable to get your location.');
      });
    } else {
      alert('You didnt allowed geo permission!');
    }
  });


  unitToggleBtn.addEventListener('click', function() {
    isC = !isC;
    unitToggleBtn.textContent = isC ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    const cityName = sinput.value.trim();
    if (cityName) {
      const [city, country] = cityName.split(',');
      getCoordinates(city.trim(), country ? country.trim() : '');
    }
  });


  function getCoordinates(cityName, countryCode = '') {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=1&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          getWeatherByCoordinates(lat, lon);
        } else {
          alert('City not found. Please try again.');
        }
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }


  function getWeatherByCoordinates(lat, lon) {
    const units = isC ? 'metric' : 'imperial';


    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        displayCurrentWeather(data);
      })
      .catch(error => console.error('Error fetching current weather:', error));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        displayForecast(data.list);
      })
      .catch(error => console.error('Error 109line:', error));
  }


  function displayCurrentWeather(data) {
    const weatherIcon = data.weather[0].icon;
    const weatherHTML = `
      <h2>${data.name}</h2>
      <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="Weather Icon">
      <p>${data.weather[0].description}</p>
      <p>Temperature: ${data.main.temp}°${isC ? 'C' : 'F'}</p>
      <p>Humidity : ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} ${isC ? 'm/s' : 'mph'}</p>
    `;
    currentWeatherDiv.innerHTML = weatherHTML;
  }


  function displayForecast(forecastData) {
    forecastDiv.innerHTML = '';
    const dailyData = {};

    forecastData.forEach(entry => {
      const date = entry.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(entry);
    });

    let c = 0;
    for (let date in dailyData) {
      if (c >= 5) break;
      const dayData = dailyData[date];

      let middayData = dayData.find(d => d.dt_txt.includes('12:00:00')) || dayData[Math.floor(dayData.length / 2)];

      const options = { weekday: 'long' };
      const dayName = new Date(date).toLocaleDateString(undefined, options);
      const icon = middayData.weather[0].icon;
      const tempMax = Math.max(...dayData.map(d => d.main.temp_max));
      const tempMin = Math.min(...dayData.map(d => d.main.temp_min));
      const forecastHTML = `
        <div class="forecast-day">
          <h3>${dayName}</h3>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
          <p>${middayData.weather[0].description}</p>
          <p>High: ${tempMax.toFixed(1)}°${isC ? 'C' : 'F'}</p>
          <p>Low: ${tempMin.toFixed(1)}°${isC ? 'C' : 'F'}</p>
        </div>
      `;
      forecastDiv.insertAdjacentHTML('beforeend', forecastHTML);
      c++;
    }
  }
});