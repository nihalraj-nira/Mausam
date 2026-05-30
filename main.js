// main.js
import { runStartupSequence, updateWeatherThemeAndParticles } from './animations.js';
import { processAgricultureAssessment, processHealthAssessment, processSportsMetrics, processPhotographyMetrics } from './assistants.js';
import { computeAgentResponse } from './chatbot.js';

// Configuration parameters
const METEO_API = 'https://api.open-meteo.com/v1/forecast';
const AQI_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEO_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

let globalMetricsStorage = null;
let activeChartReference = null;
let activeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // NEW: Tracks current location-native timezone state

// Initialization pipeline
document.addEventListener("DOMContentLoaded", () => {
    runStartupSequence(() => {
        initializeApplicationEvents();
        triggerAutomaticLocationSync();
        initializeNotificationEngine();
        startLiveClock();
    });
});

function initializeApplicationEvents() {
    // Top Controls
    document.getElementById('searchBtn').addEventListener('click', executeTargetSearch);
    document.getElementById('getLocationBtn').addEventListener('click', triggerAutomaticLocationSync);

    // Auto Suggestion Event Listener
    document.getElementById('cityInput').addEventListener('input', debounce(handleSearchSuggestions, 300));
    document.getElementById('cityInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') executeTargetSearch(); });

    // --- SPA DOMAIN PAGE ROUTING LOGIC ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const pageViews = document.querySelectorAll('.page-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            // 1. Remove active state from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // 2. Add active state to the clicked link
            link.classList.add('active');

            // 3. Hide all pages
            pageViews.forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none'; // Force hide
            });

            // 4. Show the target page
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.display = 'block'; // Force show
            }
        });
    });

    // --- FLOATING AI CHATBOT AUTOMATION ---
    document.getElementById('chatToggleBtn').addEventListener('click', () => {
        const win = document.getElementById('chatWindow');
        win.style.display = win.style.display === 'none' ? 'flex' : 'none';
    });
    document.getElementById('closeChatBtn').addEventListener('click', () => {
        document.getElementById('chatWindow').style.display = 'none';
    });
    document.getElementById('sendChatBtn').addEventListener('click', dispatchUserChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') dispatchUserChatMessage(); });

    // PWA Lifecycle Hooks
    window.addEventListener('online', () => dispatchSystemStatusChange(true));
    window.addEventListener('offline', () => dispatchSystemStatusChange(false));
}

// --- GEOLOCATION & GEOCODING ---
function triggerAutomaticLocationSync() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const metadata = await performReverseGeocoding(latitude, longitude);
        processSystemTelemetryUpdate(latitude, longitude, metadata);
    }, () => {
        // Fallback profile if GPS is denied
        processSystemTelemetryUpdate(25.6127, 85.1376, "Patna, Bihar, India");
    });
}

async function performReverseGeocoding(lat, lon) {
    try {
        const res = await fetch(`${REVERSE_GEO_API}?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const d = await res.json();
        const city = d.city || d.locality || d.district || "Target Sector";
        const state = d.principalSubdivision || "State Bounds";
        const country = d.countryName || "Global Framework";
        return `${city}, ${state}, ${country}`;
    } catch {
        return `Sector [${lat.toFixed(2)}, ${lon.toFixed(2)}]`;
    }
}

async function executeTargetSearch() {
    const input = document.getElementById('cityInput').value.trim();
    if (!input) return;

    try {
        const res = await fetch(`${GEO_API}?name=${encodeURIComponent(input)}&count=1&language=en&format=json`);
        const d = await res.json();
        if (d.results && d.results[0]) {
            const match = d.results[0];
            const nameResolved = `${match.name}, ${match.admin1 || ''} ${match.country}`;
            processSystemTelemetryUpdate(match.latitude, match.longitude, nameResolved);
            document.getElementById('suggestionsBox').style.display = 'none';
        }
    } catch (e) {
        console.error("Geocoding fetch error:", e);
    }
}

async function handleSearchSuggestions() {
    const query = document.getElementById('cityInput').value.trim();
    const box = document.getElementById('suggestionsBox');
    if (query.length < 3) { box.style.display = 'none'; return; }

    try {
        const res = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=4&language=en&format=json`);
        const d = await res.json();
        if (d.results) {
            box.innerHTML = d.results.map(r => `
                <div class="suggestion-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}, ${r.admin1 || ''} ${r.country}">
                    <i class="fa-solid fa-location-dot"></i> <b>${r.name}</b>, <span style="font-size:0.85rem; color:var(--text-muted);">${r.admin1 || ''} (${r.country})</span>
                </div>
            `).join('');
            box.style.display = 'block';

            box.querySelectorAll('.suggestion-item').forEach(el => {
                el.addEventListener('click', () => {
                    document.getElementById('cityInput').value = el.dataset.name;
                    processSystemTelemetryUpdate(parseFloat(el.dataset.lat), parseFloat(el.dataset.lon), el.dataset.name);
                    box.style.display = 'none';
                });
            });
        } else { box.style.display = 'none'; }
    } catch { box.style.display = 'none'; }
}

// --- MAIN DATA PIPELINE ---
async function processSystemTelemetryUpdate(lat, lon, label) {
    const weatherUrl = `${METEO_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,visibility,weather_code&hourly=temperature_2m,weather_code&daily=uv_index_max,sunrise,sunset,temperature_2m_max,weather_code&timezone=auto`;
    const aqiUrl = `${AQI_API}?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;

    try {
        const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(aqiUrl)]);
        const wData = await wRes.json();
        const aData = await aRes.json();

        const current = wData.current;
        const aqi = aData.current.european_aqi || 25;
        const uv = wData.daily.uv_index_max[0] || 2;
        const condition = parseCodeToConditionString(current.weather_code);

        // NEW: Sync targeted location's regional timezone string dynamically
        activeTimezone = wData.timezone;

        globalMetricsStorage = {
            temp: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            wind: current.wind_speed_10m,
            aqi: aqi,
            desc: condition,
            visibility: current.visibility
        };

        // UI State Updates
        document.getElementById('locationName').innerText = label;
        document.getElementById('geoCoords').innerText = `Lat: ${lat.toFixed(4)} | Lon: ${lon.toFixed(4)}`;
        document.getElementById('currentTemp').innerText = Math.round(current.temperature_2m);
        document.getElementById('weatherDesc').innerText = condition.toUpperCase();
        document.getElementById('feelsLike').innerText = `${Math.round(current.apparent_temperature)}°C`;
        document.getElementById('humidityVal').innerText = `${current.relative_humidity_2m}%`;
        document.getElementById('windVal').innerText = `${current.wind_speed_10m} km/h`;
        document.getElementById('visibilityVal').innerText = `${(current.visibility / 1000).toFixed(1)} km`;
        document.getElementById('aqiVal').innerText = aqi;
        document.getElementById('aqiDesc').innerText = getAqiDescriptorString(aqi);
        document.getElementById('uvVal').innerText = uv;
        document.getElementById('uvDesc').innerText = getUvDescriptorString(uv);

        document.getElementById('sunriseTime').innerText = wData.daily.sunrise[0].split('T')[1];
        document.getElementById('sunsetTime').innerText = wData.daily.sunset[0].split('T')[1];

        // Layout Theme & Particles
        updateWeatherThemeAndParticles(condition, checkNightCycleActive(wData.daily.sunrise[0], wData.daily.sunset[0]));

        // Module Execution
        executeAssistantModules(current, aqi, uv);
        renderForecastChartAnalytics(wData.hourly);
        renderMiniForecastCards(wData.daily);

    } catch (e) {
        console.error("Data pipeline processing error:", e);
    }
}

// --- DOMAIN ASSISTANTS ---
function executeAssistantModules(current, aqi, uv) {
    const ag = processAgricultureAssessment(current.temperature_2m, current.relative_humidity_2m, current.wind_speed_10m);
    document.getElementById('agScore').innerText = `${ag.score}/100`;
    document.getElementById('agInsights').innerHTML = ag.metrics.map(m => `<li>${m}</li>`).join('');

    const hl = processHealthAssessment(current.temperature_2m, aqi, uv);
    document.getElementById('healthScore').innerText = `${hl.score}/100`;
    document.getElementById('healthInsights').innerHTML = hl.metrics.map(m => `<li>${m}</li>`).join('');

    const sp = processSportsMetrics(current.temperature_2m, current.wind_speed_10m, aqi);
    document.getElementById('sportsInsights').innerHTML = sp.map(m => `<li>${m}</li>`).join('');

    const ph = processPhotographyMetrics(current.visibility, uv, current.temperature_2m);
    document.getElementById('photoInsights').innerHTML = ph.features.map(m => `<li>${m}</li>`).join('');
}

// --- CHART ANALYTICS ---
function renderForecastChartAnalytics(hourly) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    if (activeChartReference) activeChartReference.destroy();

    const labels = hourly.time.slice(0, 24).map(t => t.split('T')[1]);
    const temps = hourly.temperature_2m.slice(0, 24);

    activeChartReference = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature Horizon (°C)',
                data: temps,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b' } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } }
            }
        }
    });
}

// --- MINI FORECAST CARDS (NEXT 3 DAYS) ---
function renderMiniForecastCards(daily) {
    const cards = document.querySelectorAll('.mini-day-card');
    if (!cards || cards.length < 3) return;

    for (let i = 0; i < 3; i++) {
        const targetIndex = i + 1; // indices 1, 2, and 3

        let dayName = "Tomorrow";
        if (i > 0) {
            const dateObj = new Date(daily.time[targetIndex]);
            dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        }

        const tempMax = Math.round(daily.temperature_2m_max[targetIndex]);
        const iconClass = getFontAwesomeIcon(daily.weather_code[targetIndex]);

        cards[i].innerHTML = `
            <i class="${iconClass}"></i>
            <span class="day-name">${dayName}</span>
            <span class="day-temp">${tempMax}°</span>
        `;
    }
}

// --- CHATBOT DISPATCHER ---
function dispatchUserChatMessage() {
    const inp = document.getElementById('chatInput');
    const txt = inp.value.trim();
    if (!txt) return;

    appendMsgToHistory(txt, 'user-msg');
    inp.value = '';

    setTimeout(() => {
        const resp = computeAgentResponse(txt, globalMetricsStorage);
        appendMsgToHistory(resp, 'bot-msg');
    }, 450);
}

// --- STRING FORMATTERS & MAPPER UTILS ---
function appendMsgToHistory(message, className) {
    const body = document.getElementById('chatHistory');
    const row = document.createElement('div');
    row.className = className;
    row.innerText = message;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
}

function parseCodeToConditionString(code) {
    if ([0].includes(code)) return 'clear';
    if ([1, 2, 3].includes(code)) return 'cloudy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([95, 96, 99].includes(code)) return 'thunderstorm';
    return 'cloudy';
}

function getFontAwesomeIcon(code) {
    if ([0].includes(code)) return 'fa-solid fa-sun';
    if ([1, 2].includes(code)) return 'fa-solid fa-cloud-sun';
    if ([3].includes(code)) return 'fa-solid fa-cloud';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'fa-solid fa-cloud-showers-heavy';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'fa-solid fa-snowflake';
    if ([95, 96, 99].includes(code)) return 'fa-solid fa-cloud-bolt';
    return 'fa-solid fa-cloud';
}

function getAqiDescriptorString(aqi) {
    if (aqi <= 20) return "Good";
    if (aqi <= 40) return "Moderate";
    if (aqi <= 60) return "Poor";
    if (aqi <= 100) return "Very Poor";
    return "Hazardous";
}

// --- SYSTEM & NETWORK ---
function getUvDescriptorString(uv) {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
}

function checkNightCycleActive(sr, ss) {
    const n = new Date().getTime();
    return (n < new Date(sr).getTime() || n > new Date(ss).getTime());
}

function initializeNotificationEngine() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function dispatchSystemStatusChange(isOnline) {
    const statusTag = document.getElementById('networkStatus');
    statusTag.innerHTML = isOnline ? '<i class="fa-solid fa-wifi"></i> Online' : '<i class="fa-solid fa-wifi" style="color: red;"></i> Offline';

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("MausamAI Network Alert", {
            body: isOnline ? "System connection restored. Live telemetry streaming normalized." : "System link dropped. Offline Asset Core Caching engine deployed.",
            icon: "assets/icons/icon-192.png"
        });
    }
}

function debounce(fn, delay) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// --- LIVE SYSTEM CLOCK ---
function startLiveClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;

    const updateTime = () => {
        const now = new Date();
        try {
            // Force the system parameters to calculate string presentation under current regional rules
            clockElement.innerText = now.toLocaleTimeString('en-US', {
                timeZone: activeTimezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (e) {
            // Safe execution fallback if API timezone resolution drops out temporarily
            clockElement.innerText = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    };

    updateTime(); // Initial call
    setInterval(updateTime, 1000); // Tick every second
}