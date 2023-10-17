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
      searchForm=document.getElementById("search"),
      lastUpdate = document.querySelector(".last-update"),
      listTime = document.querySelector(".card-temp"),
      cardBox = document.querySelector(".cardBox"),
      cityList = document.getElementById("cityList");
      
      
let cityDefault = "Madrid";
let unitGroup = "metric";

let lastCityList = [];

let skipAddCityToList = false;




let store = {
    address: "",
    resolvedAddress:"",
    conditions: "",
    timezone:"",
    feelslike: 0,
    humidity:0,
    datetime:"",
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
const fetchData = async (city, unit) => {
    try{
    const result = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unit}&key=GCW6K77WPADHN62ZFESTKVZ8K&contentType=json`);
    const data = await result.json();

    //Desctructuring
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
            icon,
            datetime,
            
        },
        resolvedAddress,
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
        datetime,
        description,
        visibility,
        timezone,
        resolvedAddress,
        icon,
        days: firstSevenDays,
    };
    console.log(store);

     renderComponents();
     weekForecast();

     if (!skipAddCityToList) {
        addCityToList(store.address, getImage(store.icon), store.temp, getHour(store.timezone));
    }
    skipAddCityToList = false;

    }catch(err){
        console.log(err);
    }
};

//Listener card 
document.addEventListener("DOMContentLoaded", function() {
    // Tu código JavaScript aquí
    const cityItems = document.querySelectorAll(".city-item");

    cityItems.forEach((cityItem) => {
        cityItem.addEventListener("click", () => {
            const cityName = cityItem.textContent;
            fetchData(cityName, unitGroup);
        });
    });

    // Otro código que quieras ejecutar después de que el DOM se haya cargado completamente.
});
    



//Search form listener
 searchForm.addEventListener("submit", (event) =>{
     event.preventDefault();
    let location = inputSearch.value;
     location = capitalizeFirstLetter(location);
    if (location !== "") {
       fetchData(location, unitGroup); 
       currentCity.innerText = location;
     
      
       inputSearch.value = "";
     }
 })
//add current location to list of cities
function addCityToList(city, icon, temp, time) {

    const cityList = document.getElementById("cityList");
    const listItem = document.createElement("li");
    listItem.className = "card-item";

    listItem.innerHTML = `
    
        <div class="weather-city-item">
            <div class="card-info">
                <p class="card-name">${city}</p>
                <span>
                    <img src="${icon}" alt="" class="img-card">

                </span>
                <span class="card-temp">${temp}°</span>
            </div>
            <span class="time-card">${time}</span>
        </div>
    `;

    cityList.appendChild(listItem);

    while (cityList.children.length > 3) {
        cityList.removeChild(cityList.firstElementChild);
    }
}
//help to avoid adding cities to list every time with fetch data
function avoidAddCityToList() {
    skipAddCityToList = true;
}
// functions to change unit
function switchToCelsius() {
    unitGroup = "metric";
    avoidAddCityToList();
    fetchData(store.address, unitGroup);
    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");
    weekForecast();
}
function switchToFahrenheit() {
    unitGroup = "us";
    avoidAddCityToList();
    fetchData(store.address, unitGroup);
    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");
    weekForecast();
  
}
celsiusBtn.addEventListener("click", switchToCelsius);
fahrenheitBtn.addEventListener("click", switchToFahrenheit);

//Render main current information 
function renderComponents() {
    currentDay.innerText = getFullDate(store.timezone);
    currentCity.innerText= `${store.resolvedAddress}`;
   
    if(unitGroup==="us"){
        changeUnits();
    }else{
        currentTemp.innerText = `${store.temp}°C`;
        currentFeelsLike.innerText = `${store.feelslike}°C`;
        currentVisibility.innerText = `${store.visibility} km`;
        currentWindSpeed.innerText=`${store.windspeed} km/h`
    }
    
    currentSunrise.innerText= getTimeWithoutSeconds(store.sunrise);
    currentSunset.innerText= getTimeWithoutSeconds(store.sunset);
    currentDescription.innerText=`${store.description}`;
    currentHumidity.innerText=`${store.humidity}%`;
    currentPressure.innerText=`${store.pressure} mbar`;
    currentPrecipType.innerText= store.precipType || `-`;
    currentIndexUV.innerText=`${store.uvIndex}`;
    mainIcon.src = getImage(store.icon);
    lastUpdate.innerText = `Last update: ${getTimeWithoutSeconds(store.datetime)}`;

}
function changeUnits(){
if(unitGroup==="us")
        currentTemp.innerText = `${store.temp}°F`;
        currentFeelsLike.innerText = `${store.feelslike}°F`;
        currentVisibility.innerText = `${store.visibility} mi`;
        currentWindSpeed.innerText=`${store.windspeed} mi/h`
}
//Update Icons
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
//update week cards forecast
function weekForecast() {
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
//Manipulations with date and time
setInterval(() => {
    const currentTime = getFullDate(store.timezone);
    const listTime= getHour(store.timezone);
    currentDay.innerText = currentTime;
    listTime.innerText = listTime;
}, 60000);
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
function getHour(timezone){
    const options = {
        timeZone: timezone,
        hour12:false,
        hour: '2-digit',
        minute: '2-digit',
    };
    const time = new Date().toLocaleTimeString('en-US', options);
    return time;
}
function getTimeWithoutSeconds(dateString){
    const timeWithoutSeconds = dateString.slice(0, -3); // Elimina los últimos 3 caracteres (los segundos)
    return timeWithoutSeconds;

}
function getFullDate(timezone){
    // Formatear la fecha y hora del primer día
    const options = {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour12:false,
        hour: '2-digit',
        minute: '2-digit',
    };
    const date = new Date().toLocaleTimeString('en-US', options);

    return date;

}
function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

fetchData(cityDefault, unitGroup);

