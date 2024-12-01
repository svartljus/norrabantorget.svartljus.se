document.addEventListener("DOMContentLoaded", () => {
    const gradientPicker = document.getElementById("gradientPicker");
    const colorMarker = document.getElementById("colorMarker");
    const lights = document.querySelectorAll(".light");
    const ws = new WebSocket("wss://sync.possan.codes/broadcast/dendrolux");
    let activeColor = [255, 0, 0];
    let currentNoteMapping = [];


    // Send WebSocket message
    const sendWebSocketMessage = (type, id, color) => {
        const message = { type, id, color };
        console.log("WebSocket Message:", message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    // Select the center of the gradient picker automatically
    const selectCenterOfGradient = () => {
        const rect = gradientPicker.getBoundingClientRect();
        const x = rect.width / 2; // Center x position
        const y = rect.height / 2; // Center y position (not very relevant since it's a horizontal gradient)
        const rgbString = getColorAtPosition(x, y, gradientPicker);
        activeColor = rgbToArray(rgbString);

        // Update color marker position and color
        colorMarker.style.display = "block";
        colorMarker.style.left = `${x}px`;
        colorMarker.style.top = `${y}px`;
        colorMarker.style.backgroundColor = rgbString;

        // Calculate the base note based on the x position
        const baseNote = getBaseNoteFromPosition(x, gradientPicker.offsetWidth);
        console.log("Selected Base Note:", baseNote);

        // Generate 10 unique notes using the Lydian scale for the lights
        currentNoteMapping = generateLydianScale(baseNote);
        console.log("Generated Lydian Note Mapping for Lights:", currentNoteMapping);
    };

    // Handle click on gradient picker
    gradientPicker.addEventListener("click", (event) => {
        const rect = gradientPicker.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rgbString = getColorAtPosition(x, y, gradientPicker);
        activeColor = rgbToArray(rgbString);

        // Update color marker position and color
        colorMarker.style.display = "block";
        colorMarker.style.left = `${x}px`;
        colorMarker.style.top = `${y}px`;
        colorMarker.style.backgroundColor = rgbString;

        // Calculate the base note based on the x position
        const baseNote = getBaseNoteFromPosition(x, gradientPicker.offsetWidth);
        console.log("Selected Base Note:", baseNote);

        // Generate 10 unique notes using the Lydian scale for the lights
        currentNoteMapping = generateLydianScale(baseNote);
        console.log("Generated Lydian Note Mapping for Lights:", currentNoteMapping);
    });

    // Handle entering a light area
    const handleEnter = (event) => {
        const light = event.currentTarget;
        const lightId = parseInt(light.dataset.id) - 1; // Convert dataset id to 0-indexed value

        if (audioStarted && currentNoteMapping.length === 10) {
            light.style.setProperty("--light-bg-color", `rgb(${activeColor.join(", ")})`);
            // Retrieve the note for this light from the current note mapping
            const note = currentNoteMapping[lightId];
            if (note) {
                console.log(`Playing note for light ${lightId + 1}: ${note}`);
                playNote(note); // Use playNote() from audio.js
            } else {
                console.error(`No valid note found for light ${lightId + 1}`);
            }
        } else {
            console.warn("Audio not started or note mapping not ready.");
        }

        sendWebSocketMessage("enter", lightId + 1, activeColor);
    };

    // Handle exiting a light area
    const handleExit = (event) => {
        const light = event.currentTarget;
        const lightId = parseInt(light.dataset.id);
        light.style.setProperty("--light-bg-color", "transparent");
        sendWebSocketMessage("exit", lightId);
    };

    // Add event listeners to each light
    lights.forEach((light, index) => {
        light.dataset.id = index + 1;
        light.addEventListener("mouseenter", handleEnter);
        light.addEventListener("touchstart", handleEnter);
        light.addEventListener("mouseleave", handleExit);
        light.addEventListener("touchend", handleExit);
    });

    // Automatically select the center of the gradient picker when the page loads
    selectCenterOfGradient();
});
