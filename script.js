const API_KEY = "5602f2fbd23b36fd7d26ca79ed7ac12b";

const cityInput =
document.getElementById("cityInput");

const searchBtn =
document.getElementById("searchBtn");

const temperature =
document.getElementById("temperature");

const condition =
document.getElementById("condition");

const cityName =
document.getElementById("cityName");

const countryName =
document.getElementById("countryName");

const localTime =
document.getElementById("localTime");

const humidity =
document.getElementById("humidity");

const windSpeed =
document.getElementById("windSpeed");

const feelsLike =
document.getElementById("feelsLike");

const aqi =
document.getElementById("aqi");

const forecastContainer =
document.getElementById("forecastContainer");

const locationBtn =
document.getElementById("locationBtn");

let userSearched = false;

async function getWeather(city){

    try{

        const response =
        await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data =
        await response.json();

        if(data.cod != 200){
            throw new Error();
        }

        cityName.textContent =
        data.name;

        countryName.textContent =
        data.sys.country;

        clearInterval(window.cityClock);

        function updateCityTime(){

            const utc =
            Date.now() +
            (new Date().getTimezoneOffset() * 60000);

            const cityTime =
            new Date(
                utc +
                (data.timezone * 1000)
            );

            localTime.textContent =
            cityTime.toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            });
        }

        updateCityTime();

        window.cityClock =
        setInterval(updateCityTime,1000);

        const celsius = Math.round(data.main.temp);

        const fahrenheit =
        Math.round((celsius * 9/5) + 32);

        temperature.textContent =
        `${celsius}°C  ${fahrenheit}°F`;

        condition.textContent =
        data.weather[0].description
        .toUpperCase();

        humidity.textContent =
        `${data.main.humidity}%`;
        console.log("humidity works");

        windSpeed.textContent =
        `${Math.round(data.wind.speed * 3.6)} KM/H`;
        console.log("wind works");

        const feelsC =
        Math.round(data.main.feels_like);
        console.log("feels works");

        const feelsF =
        Math.round((feelsC * 9/5) + 32);

        feelsLike.textContent =
        `${feelsC}°C / ${feelsF}°F`;

        getAQI(
            data.coord.lat,
            data.coord.lon
        );
        console.log("aqi called");

        getForecast(city);

        setWeatherTheme(
            data.weather[0].main
        );

        if(userSearched){

            setTimeout(() => {

                const weatherSection =
                document.querySelector(".current-weather");

                const target =
                weatherSection.getBoundingClientRect().top +
                window.pageYOffset -
                200;

                window.scrollTo({
                    top: target,
                    behavior: "smooth"
                });

            }, 300);
        }

        const localHour = new Date(
            (data.dt + data.timezone) * 1000
        ).getUTCHours();

        if(localHour >= 18 || localHour < 6){
            document.body.classList.add("night");
        }else{
            document.body.classList.remove("night");
        }

stopLoading();
    }
    catch(err){
        cityName.textContent =
        "CITY NOT FOUND";
        countryName.textContent =
        "";
        temperature.textContent =
        "--°";
        condition.textContent =
        "TRY AGAIN";
        stopLoading();
        console.log(err);
    }
}


async function getAQI(lat,lon){
    try{
        const response =
        await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data =
        await response.json();
        const value =
        data.list[0].main.aqi;
        const labels = {
            1:"GOOD",
            2:"FAIR",
            3:"MODERATE",
            4:"POOR",
            5:"VERY POOR"

        };
        aqi.textContent =
        labels[value];
    }

    catch{

        aqi.textContent = "N/A";
    }
}



async function getForecast(city){

    try{

        const response =
        await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data =
        await response.json();

        drawTempGraph(
            data.list.slice(0,8)
        );

        forecastContainer.innerHTML = "";

        for(let i=0;i<5;i++){

            const item =
            data.list[i*8];

            const day =
            new Date(item.dt_txt)
            .toLocaleDateString(
                "en-US",
                {
                    weekday:"short"
                }
            );

            const temp =
            Math.round(
                item.main.temp
            );

            let icon = "☀";

            switch(item.weather[0].main){

                case "Clouds":
                    icon = "☁";
                    break;

                case "Rain":
                    icon = "🌧";
                    break;

                case "Thunderstorm":
                    icon = "⛈";
                    break;

                case "Snow":
                    icon = "❄";
                    break;
            }

            const minTemp =
            temp - Math.floor(Math.random() * 4 + 2);

        forecastContainer.innerHTML +=
        `
        <div class="forecast-row">
            <span>${day}</span>
            <span>${icon}</span>
            <span>${temp}°</span>
            <span>${minTemp}°</span>
            <span>${item.weather[0].main}</span>
        </div>
        `;
        }

    }

    catch(err){

        console.log(err);
    }
}


searchBtn.addEventListener(
"click",
()=>{

    const city =
    cityInput.value.trim();

    if(city){

        userSearched = true;  

        getWeather(city);
    }

});

cityInput.addEventListener(
"keypress",
(e)=>{

    if(e.key === "Enter"){

        const city =
        cityInput.value.trim();

        if(city){

            userSearched = true;  

            getWeather(city);
        }
    }
});

function success(position){

    const lat =
    position.coords.latitude;

    const lon =
    position.coords.longitude;

    getWeatherByCoords(
        lat,
        lon
    );
}

function error(){

    getWeather("Tokyo");
}

async function getWeatherByCoords(
lat,
lon
){

    try{

        const response =
        await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data =
        await response.json();

        getWeather(data.name);

    }

    catch{

        getWeather("Tokyo");
    }
}


function setWeatherTheme(weather){

    const weatherAdvice =
    document.getElementById(
        "weatherAdvice"
    );

        switch(weather){

            case "Clear":

                weatherAdvice.textContent =
                "PERFECT WEATHER FOR A DAY OUTSIDE";

                break;

            case "Clouds":

                weatherAdvice.textContent =
                "GREAT WEATHER FOR A PEACEFUL WALK";

                break;

            case "Rain":
            case "Drizzle":
                weatherAdvice.textContent =
                "DON'T FORGET YOUR UMBRELLA, TRAVELER";

                break;

            case "Thunderstorm":

                weatherAdvice.textContent =
                "BEST TO STAY INDOORS FOR NOW";

                break;

            case "Snow":

                weatherAdvice.textContent =
                "WEAR SOMETHING WARM";

                break;

            default:

                weatherAdvice.textContent =
                "ENJOY THE QUIET NIGHT";
        }

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rain",
        "thunderstorm",
        "snow"
    );

    clearParticles();

        switch(weather){

        case "Clear":
            document.body.classList.add(
                "sunny"
            );
            break;

        case "Clouds":
            document.body.classList.add("cloudy");
            break;

        case "Rain":
        case "Drizzle":

            document.body.classList.add("rain");

            createRain();

            break;

        case "Thunderstorm":

            document.body.classList.add("thunderstorm");

            createRain();

            break;

        case "Snow":

            document.body.classList.add("snow");

            createSnow();

            break;

        default:

            document.body.classList.add("night");
    }
}


createStars();

function createStars(){

    const particles =
    document.getElementById(
        "particles"
    );

    for(let i=0;i<150;i++){

        const star =
        document.createElement(
            "div"
        );

        star.classList.add(
            "star"
        );

        star.style.left =
        Math.random()*100 + "vw";

        star.style.top =
        Math.random()*100 + "vh";

        star.style.animationDuration =
        2 + Math.random()*4 + "s";

        particles.appendChild(
            star
        );
    }
}

function clearParticles(){

    const particles =
    document.getElementById("particles");

    particles.innerHTML = "";

    createStars();
}

function createRain(){

    const particles =
    document.getElementById("particles");

    for(let i = 0; i < 150; i++){

        const drop =
        document.createElement("div");

        drop.classList.add("raindrop");

        drop.style.left =
        Math.random() * 100 + "vw";

        drop.style.top =
        Math.random() * -100 + "px";

        drop.style.animationDuration =
        0.5 + Math.random() * 0.8 + "s";

        drop.style.animationDelay =
        Math.random() * 2 + "s";

        particles.appendChild(drop);
    }
}

function createSnow(){

    const particles =
    document.getElementById("particles");

    for(let i = 0; i < 120; i++){

        const snow =
        document.createElement("div");

        snow.classList.add("snowflake");

        snow.style.left =
        Math.random() * 100 + "vw";

        snow.style.top =
        Math.random() * -100 + "px";

        snow.style.width =
        4 + Math.random() * 8 + "px";

        snow.style.height =
        snow.style.width;

        snow.style.animationDuration =
        5 + Math.random() * 8 + "s";

        snow.style.animationDelay =
        Math.random() * 5 + "s";

        particles.appendChild(snow);
    }
}

function createSunRays(){

    const particles =
    document.getElementById("particles");

    for(let i=0;i<30;i++){

        const ray =
        document.createElement("div");

        ray.classList.add("sunray");    

        ray.style.top =
        (100 + Math.random()*40) + "px";

        ray.style.right =
        (120 + Math.random()*250) + "px";

        ray.style.height =
        (80 + Math.random()*120) + "px";

        ray.style.animationDuration =
        (2 + Math.random()*3) + "s";

        ray.style.animationDelay =
        Math.random()*3 + "s";

        particles.appendChild(ray);
    }
}

function createThunderRain(){

    const particles =
    document.getElementById("particles");

    for(let i = 0; i < 150; i++){

        const drop =
        document.createElement("div");

        drop.classList.add("raindrop");

        drop.style.left =
        Math.random() * 100 + "vw";

        drop.style.top =
        Math.random() * -100 + "px";

        drop.style.animationDuration =
        0.5 + Math.random() * 0.8 + "s";

        particles.appendChild(drop);

        if(Math.random() > 0.65){

            const windDrop =
            document.createElement("div");

            windDrop.classList.add("winddrop");

            windDrop.style.left =
            Math.random() * 100 + "vw";

            windDrop.style.top =
            Math.random() * -100 + "px";

            windDrop.style.animationDuration =
            0.5 + Math.random() * 0.8 + "s";

            particles.appendChild(windDrop);
        }
    }
}

navigator.geolocation.getCurrentPosition(
    success,
    error
);

locationBtn.addEventListener(
"click",
()=>{
    startLoading();
    navigator.geolocation.getCurrentPosition(
        success,
        error
    );
});


document.addEventListener("mousemove", (e) => {

    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;

    document.querySelector(".logo").style.transform =
    `translate(${x * 0.015}px, ${y * 0.015}px)`;

    document.querySelector(".current-weather").style.transform =
    `translate(${x * 0.01}px, ${y * 0.01}px)`;

    document.querySelector(".stats").style.transform =
    `translate(${x * 0.008}px, ${y * 0.008}px)`;

    document.querySelector(".forecast").style.transform =
    `translate(${x * 0.006}px, ${y * 0.006}px)`;

    const chart =
    document.querySelector(".hourly-chart");

    if(chart){

        const rotateY = x * 0.008;
        const rotateX = -y * 0.008;

        chart.style.transform =
        `
        translate(${x * 0.006}px, ${y * 0.006}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        `;
    }

}); 

function startLoading(){

    const bar =
    document.getElementById("loadingBar");

    bar.style.width = "0%";

    let progress = 0;

    window.loadingInterval =
    setInterval(()=>{

        if(progress < 90){

            progress += 10;

            bar.style.width =
            progress + "%";
        }

    },150);
}

function stopLoading(){

    const bar =
    document.getElementById("loadingBar");

    clearInterval(window.loadingInterval);

    bar.style.width = "100%";

    setTimeout(()=>{

        bar.style.opacity = "0";

    },200);

    setTimeout(()=>{

        bar.style.transition = "none";

        bar.style.width = "0%";

        bar.style.opacity = "1";

        void bar.offsetWidth;

        bar.style.transition =
        "width .3s ease, opacity .4s ease";

    },700);
}

function drawTempGraph(hourlyData){

    const canvas =
    document.getElementById("tempChart");

    const ctx =
    canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 300;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const temps =
    hourlyData.map(
        item => Math.round(item.main.temp)
    );

    const labels =
    hourlyData.map(item => {

        const date =
        new Date(item.dt * 1000);

        return date.getHours() + ":00";
    });

    const max =
    Math.max(...temps);

    const min =
    Math.min(...temps);

    const padding = 40;

    const graphHeight =
    canvas.height - padding * 2;

    const graphWidth =
    canvas.width - padding * 2;


    ctx.strokeStyle =
    "rgba(255,79,195,.2)";

    ctx.lineWidth = 1;

    for(let x=padding;x<canvas.width-padding;x+=20){

        ctx.beginPath();
        ctx.moveTo(x,padding);
        ctx.lineTo(
            x,
            canvas.height-padding
        );
        ctx.stroke();
    }

    for(let y=padding;y<canvas.height-padding;y+=20){

        ctx.beginPath();
        ctx.moveTo(padding,y);
        ctx.lineTo(
            canvas.width-padding,
            y
        );
        ctx.stroke();
    }


    ctx.strokeStyle =
    "#ff4fc3";

    ctx.lineWidth = 5;

    ctx.beginPath();

    temps.forEach((temp,index)=>{

        const x =
        padding +
        (index/(temps.length-1))
        * graphWidth;

        const y =
        canvas.height-padding-
        ((temp-min)/(max-min))
        * graphHeight;

        if(index===0){
            ctx.moveTo(x,y);
        }else{
            ctx.lineTo(x,y);
        }
    });

    ctx.stroke();

    ctx.fillStyle =
    "#ffd6ff";

    temps.forEach((temp,index)=>{

        const x =
        padding +
        (index/(temps.length-1))
        * graphWidth;

        const y =
        canvas.height-padding-
        ((temp-min)/(max-min))
        * graphHeight;

        ctx.fillRect(
            x-5,
            y-5,
            10,
            10
        );

        ctx.fillText(
            temp + "°",
            x-10,
            y-12
        );

        ctx.fillText(
            labels[index],
            x-12,
            canvas.height-10
        );
    });
}