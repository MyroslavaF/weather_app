const currentDay = document.getElementById("dateInfo"),
    currentCity = document.getElementById("cityTitle");
      currentTemp = document.getElementById("temperature"),
      currentSunrise = document.getElementById("sunrise"),
      currentSunset = document.getElementById("sunset"),
currentFeelsLike = document.querySelector("#feels"),
currentDescription = document.querySelector(".info"),
currentWindSpeed = document.querySelector(".wind"),
currentHumidity = document.querySelector(".humidity"),
currentPressure=document.querySelector(".pressure"),
currentPrecipType=document.querySelector(".precipType"),
currentIndexUV=document.querySelector(".uvIndex"),
currentVisibility=document.querySelector(".visibility"),
mainIcon=document.querySelector(".weatherImg"),
    weatherCards = document.querySelector(".weeklyWeather__grid"),
          inputSearch= document.getElementById("inputSearch"),
          celsiusBtn = document.querySelector(".celsius"),
          fahrenheitBtn = document.querySelector(".fahrenheit"),
          tempUnit=document.querySelector(".temp-unit"),
      searchForm=document.getElementById("search");


let cityDefault = "Madrid";
let currentUnit = "C";

let store = {
    address: "",
    conditions: "",
    timezone:"",
    feelslike: 0,
    humidity:0,
    pressure:0,
    sunrise:"",
    sunset:"",
    temp:0,
    icon:"",
    windspeed:0,
    preciptype: "",
    visibility:0,
    uvindex:0,
    description:"",
    days:[]

}
const fetchData = async (city) => {
    try{
    const result = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=GCW6K77WPADHN62ZFESTKVZ8K&contentType=json`);
    const data = await result.json();

    const {
        currentConditions: {
            conditions,
            feelslike,
            humidity,
            pressure,
            sunrise,
            sunset,
            temp,
            windspeed,
            uvindex: uvIndex,
            preciptype: precipType,
            visibility,
            icon
        },
        address,
        description,
        timezone,
        days
    } = data;

    const firstSevenDays = days.slice(0, 7).map(day => ({
        date: day.datetime,
        maxTemp: day.tempmax,
        minTemp: day.tempmin,
        iconDay: day.icon,
        conditionsDay: day.conditions
    }));

    store = {
        ...store,
        address,
        conditions,
        feelslike,
        humidity,
        pressure,
        sunrise,
        sunset,
        temp,
        windspeed,
        precipType,
        uvIndex,
        description,
        visibility,
        timezone,
        icon,
        days: firstSevenDays,
    };
    console.log(data);
    console.log(store);

    renderComponents(currentUnit);
    weekForecast(currentUnit);

    }catch(err){
        console.log(err);
    }

};

fetchData(cityDefault);
//searchCity

searchForm.addEventListener("submit", (event) =>{
    event.preventDefault();
    let location = inputSearch.value;
    location = capitalizarPrimeraLetra(location);
    if (location !== "") {
       currentCity.innerText = location;
       fetchData(location);
       
    }
})

function capitalizarPrimeraLetra(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// function to change unit

function switchToCelsius() {
    currentUnit = "C";
    renderComponents(currentUnit);
    weekForecast(currentUnit);
    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");
}
// Función para cambiar la unidad de temperatura a Fahrenheit
function switchToFahrenheit() {
    currentUnit = "F";
    renderComponents(currentUnit);
    weekForecast(currentUnit);
    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");

}

celsiusBtn.addEventListener("click", switchToCelsius);
fahrenheitBtn.addEventListener("click", switchToFahrenheit);




//Render Information
function renderComponents(currentUnit) {
    currentDay.innerText = getFullDate(store.timezone);
    currentCity.innerText= store.address;
    if (currentUnit === "C") {
        currentTemp.innerText = `${store.temp}°C`;
    } else {
        const tempFahrenheit = celsiusToFahrenheit(store.temp);
        currentTemp.innerText = `${tempFahrenheit}°F`;
    }
    currentSunrise.innerText=`${store.sunrise}`;
    currentSunset.innerText=`${store.sunset}`;
    currentFeelsLike.innerText=`${store.feelslike}°`;
    currentDescription.innerText=`${store.description}`;
    currentWindSpeed.innerText=`${store.windspeed} km/h`;
    currentHumidity.innerText=`${store.humidity}%`;
    currentPressure.innerText=`${store.pressure} mbar`;
    currentPrecipType.innerText= store.precipType || `-`;
    currentIndexUV.innerText=`${store.uvIndex}`;
    currentVisibility.innerText=`${store.visibility} km`;
    mainIcon.src = getImage(store.icon);

}

//Udpade Icon
function getImage(conditions){

    switch(conditions){
        case "clear-day":
            return "img/Sunny.png";
            break;
        case "clear-night":
            return "img/clear-night.png";
            break;
        case "partly-cloudy-day":
            return "img/partly_cloudy.png";
            break;
        case "partly-cloudy-night":
            return "img/partly-cloudy-night.png";
            break;
        case "rain":
            return "img/rain.png";
            break;
        case "snow":
            return "img/Snow.png";
            break;
        case "cloudy":
            return "img/cloudy.png";
            break;
        case "wind":
            return "img/clear-night.png";
            break;
        case "fog":
            return "img/clear-night.png";
            break;
    }

}

//Update time every second

setInterval(() => {
    const currentTime = getFullDate(store.timezone); // Obtener la hora actual
    currentDay.innerText = currentTime;

}, 60000);

//update week forecast
function weekForecast(currentUnit) {
    const numCards = 7; // Número de tarjetas a crear para la semana

    const weatherCards = document.querySelector(".weeklyWeather__grid");
    weatherCards.innerHTML = "";

    for (let i = 0; i < numCards; i++) {
        const dayData = store.days[i]; // Obtén los datos del día correspondiente

        const card = document.createElement("div");
        card.classList.add("card");
        const dayOfWeek = getDayOfWeek(dayData.date);
        const dateOfWeek = getDateOfWeek(dayData.date);

        let maxTemp = dayData.maxTemp;
        let minTemp = dayData.minTemp;
        if (currentUnit === "F") {
            maxTemp = celsiusToFahrenheit(maxTemp);
            minTemp = celsiusToFahrenheit(minTemp);
        }


        // Crea contenido HTML para la tarjeta de pronóstico
        card.innerHTML = `
                <p class="title_day">${dayOfWeek}</p>
                <p class = "date">${dateOfWeek}</p>
                <div class="temperature">
                    <p>max. ${maxTemp}°</p>
                    <p>min. ${minTemp}°</p>
                </div>
                <div class="icon-wrapper">
                   <img src="${getImage(dayData.iconDay)}" alt="Icono del tiempo" class="imgWeeklyWeather">
                </div>
                
                <p class="conditions">${dayData.conditionsDay}</p>
    `;

        // Agrega la tarjeta al contenedor de tarjetas de pronóstico
        weatherCards.appendChild(card);
    }
}
function getDayOfWeek(dateString) {

        const days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];

    const date = new Date(dateString);
    const nameDay = date.getDay();
    return days[nameDay];
}
function getDateOfWeek(dateString){
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const date = new Date(dateString);
    const numberDate = date.getDate();
    const month = months[date.getMonth()];
    return `${numberDate} ${month}`
}
function getFullDate(timezone){
    // Formatear la fecha y hora del primer día
    const options = {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour12:false,
        hour: '2-digit',
        minute: '2-digit',
    };
    const date = new Date().toLocaleTimeString('en-US', options).replace(/,/g, '');

    return date;

}
function celsiusToFahrenheit(celsius) {
        return ((celsius * 9) / 5 + 32).toFixed(1);
}
