const app = {
	apiKey: '35545a9a120d7f1193670e2f13d3c4bb',
	units: 'imperial',
	lang: 'en',
	init: () => {
	  document
		.getElementById('btnSearch')
		.addEventListener('click', () => app.fetchWeather());
	  document
		.getElementById('btnLocation')
		.addEventListener('click', app.getLocation);
	},
	getLocation: () => {
	  if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
		  (position) => {
			const { latitude: lat, longitude: lon } = position.coords;
			app.fetchWeather({ lat, lon });
		  },
		  (error) => {
			console.error(error);
			alert('Unable to get location. Please allow location access.');
		  }
		);
	  } else {
		alert('Geolocation is not supported by your browser.');
	  }
	},
	fetchWeather: (coords) => {
	  let params = coords
		? `lat=${coords.lat}&lon=${coords.lon}`
		: `q=${document.getElementById('city').value.trim()}`;
   
	  if (!params) {
		alert('Please enter a city name.');
		return;
	  }
   
	  const baseUrl = `https://api.openweathermap.org/data/2.5/`;
	  const currentUrl = `${baseUrl}weather?${params}&appid=${app.apiKey}&units=${app.units}&lang=${app.lang}`;
	  const forecastUrl = `${baseUrl}forecast?${params}&appid=${app.apiKey}&units=${app.units}&lang=${app.lang}`;
   
	  Promise.all([fetch(currentUrl), fetch(forecastUrl)])
		.then((responses) => Promise.all(responses.map((resp) => resp.json())))
		.then(([current, forecast]) => {
		  if (current.cod !== 200) throw new Error(current.message);
		  if (forecast.cod !== '200') throw new Error(forecast.message);
   
		  app.showWeather(current);
		  app.showForecast(forecast);
		  if (coords) {
			document.getElementById('city').value = current.name;
		  }
		})
		.catch((err) => {
		  console.error(err);
		  alert(`Error getting weather: ${err.message}`);
		});
	},
	showWeather: (resp) => {
	  if (!resp || !resp.weather || !resp.weather[0]) {
		alert('Invalid weather data');
		return;
	  }
   
	  let currentWeather = document.querySelector('.current-weather');
	  currentWeather.innerHTML = `
		<div class="text-center">
		  <h2 class="mb-4">${resp.name} - Current Weather</h2>
		  <div class="d-flex flex-column align-items-center">
			<img
			  src="http://openweathermap.org/img/wn/${resp.weather[0].icon}@4x.png"
			  alt="${resp.weather[0].description}"
			  class="mb-3"
			/>
			<div class="mb-3">
			  <h3>${Math.round(resp.main.temp)}°F</h3>
			  <p class="mb-3">${resp.weather[0].main} - ${resp.weather[0].description}</p>
			</div>
			<div>
			  <p>Feels like: ${Math.round(resp.main.feels_like)}°F</p>
			  <p>Humidity: ${resp.main.humidity}%</p>
			  <p class="mb-0">Wind: ${Math.round(resp.wind.speed)} mph</p>
			</div>
		  </div>
		</div>`;
	},
	showForecast: (resp) => {
	  if (!resp || !resp.list || resp.list.length === 0) {
		alert('Invalid forecast data');
		return;
	  }
   
	  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	  let dailyData = resp.list.filter((item, index) => index % 8 === 0).slice(0, 5);
   
	  let forecast = document.querySelector('.forecast');
	  forecast.innerHTML = dailyData
		.map(
		  (day) => `
		  <div class="col text-center">
			<div class="card">
			  <div class="card-body">
				<h5 class="mb-3">${days[new Date(day.dt * 1000).getDay()]}</h5>
				<img
				  src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
				  alt="${day.weather[0].description}"
				  class="mb-2"
				/>
				<p class="mb-2">${Math.round(day.main.temp)}°F</p>
				<p class="mb-0">${day.weather[0].main}</p>
			  </div>
			</div>
		  </div>`
		)
		.join('');
	},
  };
   
  app.init();
   