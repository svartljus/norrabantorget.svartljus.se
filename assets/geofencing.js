// Geofencing.js
const targetCoordinates = { lat: 59.3351653, lng: 18.0542497 };
const maxDistance = 500; // in meters

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lat2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function checkGeofencing() {
    const startButton = document.getElementById("startButton");

    // Check for admin bypass in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("admin")) {
        alert("Admin bypass activated. Geofencing check skipped.");
        startButton.disabled = false;
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        startButton.textContent = "Geolocation Not Supported";
        startButton.disabled = true;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(
                latitude,
                longitude,
                targetCoordinates.lat,
                targetCoordinates.lng
            );

            if (distance <= maxDistance) {
                startButton.disabled = false;
            } else {
                alert("You need to be within 500 meters of the installation to play.");
                startButton.textContent = "Out of Range";
                startButton.disabled = true;
            }
        },
        (error) => {
            alert("Unable to retrieve your location.");
            startButton.textContent = "Location Error";
            startButton.disabled = true;
        }
    );
}

// Run the geofencing check on page load
document.addEventListener("DOMContentLoaded", checkGeofencing);
