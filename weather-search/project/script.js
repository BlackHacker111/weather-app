// OpenWeatherMap API configuration
const API_KEY = '2ac39ca067f53409430c810a4d55c105'; // Add your OpenWeatherMap API key here
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');
const currentDate = document.getElementById('currentDate');
const currentTime = document.getElementById('currentTime');
const mainCityName = document.getElementById('mainCityName');
const mainTemp = document.getElementById('mainTemp');
const mainStatus = document.getElementById('mainStatus');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const uvIndex = document.getElementById('uvIndex');
const mainCloud = document.getElementById('mainCloud');
const mainSun = document.getElementById('mainSun');
const rainDrops = document.getElementById('rainDrops');
const temperatureChart = document.getElementById('temperatureChart');

// Default cities for side panel
const defaultCities = ['London', 'Tokyo', 'Paris', 'Sydney'];
let currentCity = 'New York';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
    }
    
    // Load default weather data
    loadWeatherData(currentCity);
    loadSidePanelCities();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    themeToggle.addEventListener('change', toggleTheme);
    
    // Add click handlers for city cards
    document.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', function() {
            const cityName = this.getAttribute('data-city');
            loadWeatherData(cityName);
            currentCity = cityName;
        });
    });
});

// Update date and time
function updateDateTime() {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    
    currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    currentTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Handle search
function handleSearch() {
    const cityName = searchInput.value.trim();
    if (cityName) {
        loadWeatherData(cityName);
        currentCity = cityName;
        searchInput.value = '';
    }
}

// Load weather data for a city
async function loadWeatherData(cityName) {
    try {
        // If no API key, use mock data
        if (!API_KEY) {
            loadMockWeatherData(cityName);
            return;
        }
        
        const response = await fetch(`${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            updateMainWeatherCard(data);
            loadForecastData(cityName);
        } else {
            console.error('Weather data not found');
            loadMockWeatherData(cityName);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        loadMockWeatherData(cityName);
    }
}

// Load forecast data for chart
async function loadForecastData(cityName) {
    try {
        if (!API_KEY) {
            drawMockChart();
            return;
        }
        
        const response = await fetch(`${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            drawTemperatureChart(data);
        } else {
            drawMockChart();
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        drawMockChart();
    }
}

// Update main weather card
function updateMainWeatherCard(data) {
    mainCityName.textContent = data.name;
    mainTemp.textContent = `${Math.round(data.main.temp)}°C`;
    mainStatus.textContent = data.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    humidity.textContent = `${data.main.humidity}%`;
    uvIndex.textContent = Math.floor(Math.random() * 10) + 1; // Mock UV index
    
    // Update weather animation
    updateWeatherAnimation(data.weather[0].main);
}

// Update weather animation based on weather condition
function updateWeatherAnimation(weatherCondition) {
    // Reset all animations
    mainCloud.style.display = 'none';
    mainSun.style.display = 'none';
    rainDrops.style.display = 'none';
    
    switch (weatherCondition.toLowerCase()) {
        case 'rain':
        case 'drizzle':
            mainCloud.style.display = 'block';
            rainDrops.style.display = 'block';
            break;
        case 'clear':
            mainSun.style.display = 'block';
            break;
        case 'clouds':
            mainCloud.style.display = 'block';
            break;
        case 'snow':
            mainCloud.style.display = 'block';
            // Add snow animation here if needed
            break;
        default:
            mainCloud.style.display = 'block';
    }
}

// Load mock weather data when API is not available
function loadMockWeatherData(cityName) {
    const mockData = {
        name: cityName,
        main: {
            temp: Math.floor(Math.random() * 30) + 5,
            humidity: Math.floor(Math.random() * 40) + 40
        },
        weather: [{
            main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
            description: 'partly cloudy'
        }],
        wind: {
            speed: Math.floor(Math.random() * 10) + 5
        }
    };
    
    updateMainWeatherCard(mockData);
    drawMockChart();
}

// Load side panel cities
async function loadSidePanelCities() {
    const cityCards = document.querySelectorAll('.city-card');
    
    cityCards.forEach(async (card, index) => {
        const cityName = defaultCities[index];
        
        try {
            if (!API_KEY) {
                updateCityCard(card, {
                    name: cityName,
                    main: { temp: Math.floor(Math.random() * 30) + 5 },
                    weather: [{ main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)] }]
                });
                return;
            }
            
            const response = await fetch(`${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
            const data = await response.json();
            
            if (response.ok) {
                updateCityCard(card, data);
            } else {
                updateCityCard(card, {
                    name: cityName,
                    main: { temp: Math.floor(Math.random() * 30) + 5 },
                    weather: [{ main: 'Clear' }]
                });
            }
        } catch (error) {
            console.error('Error loading city data:', error);
            updateCityCard(card, {
                name: cityName,
                main: { temp: Math.floor(Math.random() * 30) + 5 },
                weather: [{ main: 'Clear' }]
            });
        }
    });
}

// Update city card
function updateCityCard(card, data) {
    const cityName = card.querySelector('.city-name');
    const cityTemp = card.querySelector('.city-temp');
    const cityStatus = card.querySelector('.city-status');
    const cityIcon = card.querySelector('.city-icon');
    
    cityName.textContent = data.name;
    cityTemp.textContent = `${Math.round(data.main.temp)}°C`;
    cityStatus.textContent = data.weather[0].main;
    
    // Update icon based on weather
    const weatherIcons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Snow': '❄️',
        'Thunderstorm': '⛈️',
        'Drizzle': '🌦️',
        'Mist': '🌫️'
    };
    
    cityIcon.textContent = weatherIcons[data.weather[0].main] || '🌤️';
}

// Draw temperature chart
function drawTemperatureChart(forecastData) {
    const canvas = temperatureChart;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Process forecast data (5 days)
    const dailyData = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Find forecast data for this day (or use mock data)
        const dayData = forecastData.list.find(item => {
            const itemDate = new Date(item.dt * 1000);
            return itemDate.getDate() === date.getDate();
        });
        
        dailyData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temp: dayData ? Math.round(dayData.main.temp) : Math.floor(Math.random() * 10) + 15
        });
    }
    
    drawChart(ctx, canvas, dailyData);
}

// Draw mock chart
function drawMockChart() {
    const canvas = temperatureChart;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mock data
    const mockData = [
        { day: 'Mon', temp: 22 },
        { day: 'Tue', temp: 25 },
        { day: 'Wed', temp: 20 },
        { day: 'Thu', temp: 28 },
        { day: 'Fri', temp: 24 }
    ];
    
    drawChart(ctx, canvas, mockData);
}

// Draw chart helper function
function drawChart(ctx, canvas, data) {
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Find min and max temperatures
    const temps = data.map(d => d.temp);
    const minTemp = Math.min(...temps) - 5;
    const maxTemp = Math.max(...temps) + 5;
    
    // Calculate positions
    const points = data.map((d, i) => ({
        x: padding + (i * chartWidth) / (data.length - 1),
        y: padding + chartHeight - ((d.temp - minTemp) / (maxTemp - minTemp)) * chartHeight,
        temp: d.temp,
        day: d.day
    }));
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, canvas.height - padding);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Draw line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    
    // Draw points and labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px SF Pro Display, sans-serif';
    ctx.textAlign = 'center';
    
    points.forEach(point => {
        // Draw point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw temperature label
        ctx.fillText(`${point.temp}°`, point.x, point.y - 15);
        
        // Draw day label
        ctx.fillText(point.day, point.x, canvas.height - padding + 20);
    });
}

// Add some nice loading states and error handling
function showLoading() {
    mainStatus.textContent = 'Loading...';
}

function showError(message) {
    mainStatus.textContent = message || 'Error loading weather data';
}

// Add smooth transitions when updating data
function updateWithAnimation(element, newValue) {
    element.style.opacity = '0.5';
    setTimeout(() => {
        element.textContent = newValue;
        element.style.opacity = '1';
    }, 200);
}