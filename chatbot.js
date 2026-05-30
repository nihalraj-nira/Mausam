// chatbot.js

export function computeAgentResponse(userQuery, activeMetrics) {
    const clean = userQuery.toLowerCase().trim();

    if (!activeMetrics || !activeMetrics.temp) {
        return "I am currently scanning the localized tracking array. Please wait for the telemetry sync to complete.";
    }

    // 14. Conversational Semantic Parser Core Rule Matrix Maps
    if (clean.includes("weather") || clean.includes("today")) {
        return `Current atmospheric conditions record ${Math.round(activeMetrics.temp)}°C alongside ${activeMetrics.humidity}% humidity parameters and a wind reading of ${activeMetrics.wind} km/h. Local status reports state: ${activeMetrics.desc}.`;
    }

    if (clean.includes("irrigate") || clean.includes("crop") || clean.includes("farming") || clean.includes("agriculture")) {
        if (activeMetrics.temp > 32 && activeMetrics.humidity < 40) {
            return "Yes, target evaporation parameters indicate an accelerated dehydration curve. Immediate irrigation routing recommended.";
        }
        return "Soil water saturation tracking suggests balanced retention levels. Standard maintenance patterns apply.";
    }

    if (clean.includes("aqi") || clean.includes("air") || clean.includes("safe") || clean.includes("health")) {
        if (activeMetrics.aqi > 100) {
            return `Negative. Local tracking reports an AQI level of ${activeMetrics.aqi}, indicating poor air quality conditions. Limit intensive physical outdoor exposures.`;
        }
        return `Affirmative. Local indices indicate an AQI value of ${activeMetrics.aqi}, denoting an uncompromised atmospheric profile. This is safe for sensitive groups.`;
    }

    if (clean.includes("cricket") || clean.includes("play") || clean.includes("sports") || clean.includes("running")) {
        if (activeMetrics.wind > 20 || activeMetrics.temp > 35) {
            return "Thermal load indicators or aerodynamic resistance profiles present risks. Postponing physical match fixtures is recommended.";
        }
        return "Match parameters match optimization criteria. Aerodynamic index and tracking configurations are completely green.";
    }

    if (clean.includes("photo") || clean.includes("camera") || clean.includes("sunset") || clean.includes("shoot")) {
        if (activeMetrics.visibility < 5000) {
            return "Atmospheric dispersion is compromised by local haze metrics. Landscape depth configurations will suffer flat structural resolution down.";
        }
        return "Excellent visual transparency metrics confirmed. Ambient light balances are ideal for chromatic capture sequences.";
    }

    if (clean.includes("wear") || clean.includes("cloth") || clean.includes("dress")) {
        if (activeMetrics.temp < 15) return "Low ambient temperature bounds active. Thermal insulating structures and layering advised.";
        if (activeMetrics.temp > 30) return "High thermal indices verified. Lightweight, breathable linen array configurations recommended.";
        return "Mild temperature threshold profile active. Standard operational clothing arrays appropriate.";
    }

    return "Query mapped outside processing definitions. Please clarify or query against parameters like crop maintenance metrics, AQI safety status, sport profiles, or photography light balances.";
}