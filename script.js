async function getWeather() {

    const city = document.getElementById("cityInput").value;

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    try {

        // Geocoding API
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

        const geoResponse = await fetch(geoURL);

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            alert("City not found!");
            return;
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Weather API
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

        const weatherResponse = await fetch(weatherURL);

        const weatherData = await weatherResponse.json();

        // Update UI
        document.getElementById("cityName").innerText =
            location.name;

        document.getElementById("temperature").innerText =
            weatherData.current.temperature_2m + "°C";

        document.getElementById("wind").innerText =
            weatherData.current.wind_speed_10m + " km/h";

        document.getElementById("humidity").innerText =
            weatherData.current.relative_humidity_2m + "%";

        // Weather Condition
        const weatherCode = weatherData.current.weather_code;

        let condition = "Clear";
        let icon = "☀️";

        if (weatherCode >= 1 && weatherCode <= 3) {
            condition = "Cloudy";
            icon = "☁️";
        }

        else if (weatherCode >= 51 && weatherCode <= 67) {
            condition = "Rainy";
            icon = "🌧️";
        }

        else if (weatherCode >= 71 && weatherCode <= 77) {
            condition = "Snow";
            icon = "❄️";
        }

        else if (weatherCode >= 95) {
            condition = "Thunderstorm";
            icon = "⛈️";
        }

        document.getElementById("condition").innerText =
            condition;

        document.querySelector(".weather-icon").innerText =
            icon;

    }

    catch (error) {

        alert("Something went wrong!");

        console.log(error);

    }

}