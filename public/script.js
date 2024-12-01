document.addEventListener("DOMContentLoaded", () => {
    const gradientPicker = document.getElementById("gradientPicker");
    const colorMarker = document.getElementById("colorMarker");
    const lights = document.querySelectorAll(".light");
    const ws = new WebSocket("wss://sync.possan.codes/broadcast/dendrolux");
    let activeColor = [255, 0, 0];
    let currentNoteMapping = [];

    const startScreen = document.getElementById("startScreen");
    const startButton = document.getElementById("startButton");

    // Handle the Start Button Click
    startButton.addEventListener("click", () => {
        // Start the AudioContext using the function from audio.js
        startAudioContext();
        // Hide the start screen
        startScreen.remove();
    });

    // Send WebSocket message
    const sendWebSocketMessage = (type, id, color) => {
        const message = { type, id, color };
        console.log("WebSocket Message:", message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    // Convert rgb string to array
    const rgbToArray = (rgbString) => {
        return rgbString.match(/\d+/g).map(Number);
    };

    // Determine base note from position on gradient picker
    const getBaseNoteFromPosition = (x, width) => {
        const scale = ["C", "D", "E", "F", "G", "A", "B"];
        const octaveRange = [3, 4, 5]; // Available octaves
        const totalNotes = scale.length * octaveRange.length;

        // Normalize position to a note index
        const noteIndex = Math.floor((x / width) * totalNotes);
        const note = scale[noteIndex % scale.length];
        const octave = octaveRange[Math.floor(noteIndex / scale.length)];

        if (!note || isNaN(octave)) {
            console.error("Invalid note or octave calculation");
            return "C4"; // Fallback to default note
        }

        return `${note}${octave}`;
    };

    // Generate Lydian scale notes based on the base note
    const generateLydianScale = (baseNote) => {
        const scaleNotes = ["C", "D", "E", "F#", "G", "A", "B"];
        const baseNoteName = baseNote.slice(0, -1);
        const octave = parseInt(baseNote.slice(-1));

        if (!scaleNotes.includes(baseNoteName) || isNaN(octave)) {
            console.error("Invalid base note for Lydian scale generation");
            return generateLydianScale("C4"); // Fallback to default scale
        }

        let notes = [];
        const baseNoteIndex = scaleNotes.indexOf(baseNoteName);

        // Generate the Lydian scale from the base note
        for (let i = 0; i < 10; i++) {
            const noteIndex = (baseNoteIndex + i) % scaleNotes.length;
            const noteOctave =
                octave + Math.floor((baseNoteIndex + i) / scaleNotes.length);
            notes.push(`${scaleNotes[noteIndex]}${noteOctave}`);
        }
        return notes;
    };

    // Get color at the position on the gradient picker
    const getColorAtPosition = (x, y, element) => {
        const canvas = document.createElement("canvas");
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;
        const ctx = canvas.getContext("2d");
        const style = window.getComputedStyle(element);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

        const colors =
            style.backgroundImage.match(/#[0-9a-f]{3,6}|rgb[a]?\([^)]+\)/g) ||
            [];
        const colorStops = colors.map((color, i) => i / (colors.length - 1));
        colorStops.forEach((stop, i) => gradient.addColorStop(stop, colors[i]));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
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
            light.style.setProperty(
                "--light-bg-color",
                `rgb(${activeColor.join(", ")})`
            );
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
