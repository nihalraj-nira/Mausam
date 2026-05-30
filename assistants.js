// assistants.js

export function processAgricultureAssessment(temp, humidity, wind) {
    const recommendations = [];
    let score = 100;

    if (temp > 35) {
        recommendations.push("⚠️ Extreme Heat Stress Detected: High operational transpiration observed.");
        score -= 25;
    }
    if (humidity < 35 && temp > 28) {
        recommendations.push("💧 Irrigation Highly Recommended: Soil evaporation depletion curve active.");
        score -= 20;
    } else if (humidity > 85) {
        recommendations.push("🍄 High Moisture Environment: Increased fungal pathogen vector probability.");
        score -= 10;
    } else {
        recommendations.push("🌱 Stabilized Evaporation Balance: Baseline maintenance window optimal.");
    }

    if (wind > 22) {
        recommendations.push("🚫 Spray Restriction: Chemical application drift hazard profile extreme.");
        score -= 15;
    }

    return { score: Math.max(0, score), metrics: recommendations };
}

export function processHealthAssessment(temp, aqi, uv) {
    const recommendations = [];
    let score = 100;

    // Air Quality Index Evaluation
    if (aqi > 100) {
        recommendations.push("😷 Hazardous Air Quality: Respiratory compromise vector high. Limit exposures.");
        score -= 35;
    } else if (aqi > 50) {
        recommendations.push("⚠️ Moderate AQI Detected: Sensitive clinical profiles should reduce exertion.");
        score -= 15;
    } else {
        recommendations.push("✅ Air Quality Safe: Atmospheric particulate concentrations nominal.");
    }

    // UV Index Scale
    if (uv >= 8) {
        recommendations.push("☀️ Extreme UV Exposure: High skin damage coefficient. Wear high SPF sunscreen.");
        score -= 25;
    } else if (uv >= 5) {
        recommendations.push("🧴 Moderate UV Protection Required: Apply block and limit continuous exposure.");
    }

    if (temp > 37) recommendations.push("💧 Critical Hydration Schedule: Active body salt depletion warning.");

    return { score: Math.max(0, score), metrics: recommendations };
}

export function processSportsMetrics(temp, wind, aqi) {
    const items = [];

    const cricket = Math.max(0, Math.round(100 - (Math.abs(temp - 24) * 2.2) - (wind > 18 ? 15 : 0) - (aqi > 75 ? 20 : 0)));
    const running = Math.max(0, Math.round(100 - (Math.abs(temp - 16) * 2.8) - (aqi > 60 ? 30 : 0)));
    const cycling = Math.max(0, Math.round(100 - (Math.abs(temp - 20) * 2.0) - (wind > 25 ? 25 : 0) - (aqi > 80 ? 15 : 0)));

    items.push(`🏏 Cricket Score: ${cricket}/100 - ${cricket > 75 ? 'Excellent match index parameters' : 'Sub-optimal atmospheric layout'}`);
    items.push(`🏃 Running Score: ${running}/100 - ${running > 70 ? 'Ideal cardiovascular ambient balance' : 'Increased metabolic load risk'}`);
    items.push(`🚴 Cycling Score: ${cycling}/100 - ${cycling > 72 ? 'Optimal path aerodynamic profile' : 'Headwind impedance profile high'}`);

    return items;
}

export function processPhotographyMetrics(visibility, uv, temp) {
    const profiles = [];
    let rating = 100;

    // Visibility Metrics Converter Profile Configuration
    const visKm = visibility / 1000;
    if (visKm < 4) {
        profiles.push("🌫️ Heavy Atmospheric Haze: Focal line landscape limits tracking down.");
        rating -= 35;
    } else if (visKm >= 10) {
        profiles.push("📸 Deep Horizon Clarity: High structural landscape composition definition.");
    } else {
        profiles.push("📸 Moderate Visibility: Standard ambient shooting conditions.");
    }

    if (uv > 6 && temp > 28) {
        profiles.push("⚠️ Midday Contrast Warning: Flat high lighting profile. Golden hour window preferred.");
        rating -= 20;
    } else {
        profiles.push("🌅 Golden Hour Analytics Ready: Ambient lighting dispersion parameters balanced.");
    }

    return { score: Math.max(20, rating), features: profiles };
}