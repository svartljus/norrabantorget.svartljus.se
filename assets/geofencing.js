const targetCoordinates = { lat: 59.3351653, lng: 18.0542497 };
const maxDistance = 500; // in meters

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function handleStartButtonClick() {
    const startButton = document.getElementById("startButton");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(
                latitude,
                longitude,
                targetCoordinates.lat,
                targetCoordinates.lng
            );

            if (distance > maxDistance) {
                alert(
                    "You are not within range (500 meters of the installation). You can still play, but actions won't impact the rings.\n\nPlease move closer and refresh the page if you'd like to enable ring interactions."
                );
            }
        },
        (error) => {
            alert(
                "Unable to retrieve your location. GPS is required for range verification."
            );
        }
    );
    
    startAudio();
}

// Run the geofencing check on page load
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", handleStartButtonClick);
});
