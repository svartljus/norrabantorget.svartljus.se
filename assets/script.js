document.addEventListener("DOMContentLoaded", () => {
    // Element Selectors
    const gradientPicker = document.getElementById("gradientPicker");
    const colorMarker = document.getElementById("colorMarker");
    const lights = document.querySelectorAll(".light");
    const content = document.querySelector(".content");
    const startScreen = document.getElementById("startScreen");
    const startButton = document.getElementById("startButton");
    const randomColorToggle = document.getElementById("randomColorToggle");

    // State Variables
    const ws = new WebSocket("wss://sync.possan.codes/broadcast/dendrolux");
    let activeColor = [255, 0, 0];
    let currentNoteMapping = [];
    let activeLight = null;
    let baseNote = "C4";
    let audioStarted = false;
    let synth = null;

    // WebSocket Messaging
    const sendWebSocketMessage = (type, id, color) => {
        console.log("WebSocket Message:", { type, id, color });
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, id, color }));
        }
    };

    // Gradient Picker Handlers
    const handleGradientClick = (event) => {
        const { x, y, rgbString } = getClickPositionAndColor(
            event,
            gradientPicker
        );
        updateActiveColor(rgbString, x, y);
    };

    const handleGradientTouchMove = (event) => {
        const touch = event.touches[0];
        const rect = gradientPicker.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));
        const rgbString = getColorAtPosition(x, y, gradientPicker);
        updateActiveColor(rgbString, x, y);
    };

    const selectCenterOfGradient = () => {
        const rect = gradientPicker.getBoundingClientRect();
        const x = rect.width / 2;
        const rgbString = getColorAtPosition(x, 0, gradientPicker);
        updateActiveColor(rgbString, x, 0);
    };

    const updateActiveColor = (rgbString, x, y) => {
        activeColor = rgbToArray(rgbString);
        updateColorMarker(x, y, rgbString);

        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            baseNote = getBaseNoteFromPosition(
                gradientPicker.offsetHeight - y,
                gradientPicker.offsetHeight
            );
        } else {
            baseNote = getBaseNoteFromPosition(x, gradientPicker.offsetWidth);
        }

        currentNoteMapping = generateLydianScale(baseNote);
    };

    // Utility to Randomize Marker Position and Color
    const randomizeColorMarker = () => {
        const rect = gradientPicker.getBoundingClientRect();
        const randomX = Math.random() * rect.width;
        const randomY = Math.random() * rect.height;
        const randomColor = getColorAtPosition(
            randomX,
            randomY,
            gradientPicker
        );
        updateActiveColor(randomColor, randomX, randomY);
    };

    // Light Interaction Handlers
    const handleEnter = (light, event = undefined) => {
        if (event !== undefined) {
            event.preventDefault();
        }

        // If random color toggle is checked, randomize the marker
        if (randomColorToggle.checked) {
            randomizeColorMarker();
        }

        const lightId = parseInt(light.dataset.id) - 1;
        console.log(lightId, currentNoteMapping);
        setLightBackgroundColor(light, activeColor);

        if (audioStarted && currentNoteMapping.length === 10) {
            const note = currentNoteMapping[lightId];
            if (note && synth) {
                try {
                    if (typeof note === "string" && note !== "undefined") {
                        synth.triggerAttackRelease(note, "16n", Tone.now());
                    } else {
                        console.error("Invalid note value", { note });
                    }
                } catch (error) {
                    console.error("Error triggering note", { note, error });
                }
            } else {
                console.error("Note or synth is undefined", { note, synth });
            }
        }

        setTimeout(() => {
            resetLightBackgroundColor(light);
        }, 300);

        sendWebSocketMessage("enter", lightId + 1, activeColor);
    };

    const handleTouchMove = (event) => {
        const touch = event.touches[0];
        const touchedElement = document.elementFromPoint(
            touch.clientX,
            touch.clientY
        );

        if (touchedElement && touchedElement.classList.contains("light")) {
            if (activeLight !== touchedElement) {
                activeLight = touchedElement;
                handleEnter(activeLight);
            }
        } else {
            activeLight = null;
        }
    };

    // Audio Handlers
    const startAudio = () => {
        if (!audioStarted) {
            synth = new Tone.Synth().toDestination();
            Tone.start()
                .then(() => {
                    audioStarted = true;
                    console.log("AudioContext started");
                    startScreen.remove();
                })
                .catch((err) => {
                    console.error("Error starting AudioContext", err);
                });
        }
    };

    // Utility Functions
    const rgbToArray = (rgbString) => rgbString.match(/\d+/g).map(Number);

    const getBaseNoteFromPosition = (x, width) => {
        const scale = ["C", "D", "E", "F#", "G", "A", "B"];
        const octaveRange = [3, 4, 5];
        const totalNotes = scale.length * octaveRange.length;

        if (width <= 0) {
            console.error(
                "Invalid width provided for gradient picker calculation"
            );
            return "C4"; // Fallback to a default note
        }

        const noteIndex = Math.max(
            0,
            Math.min(totalNotes - 1, Math.floor((x / width) * totalNotes))
        );
        const note = scale[noteIndex % scale.length];
        const octave = octaveRange[Math.floor(noteIndex / scale.length)];
        return `${note}${octave}`;
    };

    const generateLydianScale = (baseNote) => {
        const scaleNotes = ["C", "D", "E", "F#", "G", "A", "B"];
        const baseNoteName = baseNote.slice(0, -1);
        const octave = parseInt(baseNote.slice(-1));

        let notes = [];
        let baseNoteIndex = scaleNotes.indexOf(baseNoteName);

        if (baseNoteIndex === -1) {
            console.error("Invalid base note provided", { baseNote });
            baseNoteIndex = scaleNotes.indexOf("C4"); // Default to 'C' if the base note is invalid
        }

        for (let i = 0; i < 10; i++) {
            const noteIndex = (baseNoteIndex + i) % scaleNotes.length;
            const noteOctave =
                octave + Math.floor((baseNoteIndex + i) / scaleNotes.length);
            notes.push(`${scaleNotes[noteIndex]}${noteOctave}`);
        }
        return notes;
    };

    const getColorAtPosition = (x, y, element) => {
        const canvas = document.createElement("canvas");
        const isPortrait = window.innerHeight > window.innerWidth;
        canvas.width = isPortrait ? element.offsetHeight : element.offsetWidth;
        canvas.height = element.offsetHeight;

        const ctx = canvas.getContext("2d");
        const style = window.getComputedStyle(element);
        const gradient = isPortrait
            ? ctx.createLinearGradient(0, canvas.height, 0, 0)
            : ctx.createLinearGradient(0, 0, canvas.width, 0);

        const colors =
            style.backgroundImage.match(/#[0-9a-f]{3,6}|rgb[a]?\([^)]+\)/g) ||
            [];
        colors.forEach((color, i) =>
            gradient.addColorStop(i / (colors.length - 1), color)
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    };

    const getClickPositionAndColor = (event, element) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rgbString = getColorAtPosition(x, y, element);
        return { x, y, rgbString };
    };

    const updateColorMarker = (x, y, color) => {
        colorMarker.style.display = "block";
        colorMarker.style.left = `${x}px`;
        colorMarker.style.top = `${y}px`;
        colorMarker.style.backgroundColor = color;
    };

    const setLightBackgroundColor = (light, color) => {
        light.style.setProperty("--light-bg-color", `rgb(${color.join(", ")})`);
        light.style.setProperty(
            "--light-border-color",
            `rgb(${color.join(", ")})`
        );
    };

    const resetLightBackgroundColor = (light) => {
        light.style.setProperty("--light-bg-color", "black");
        // light.style.setProperty("--light-border-color", "white");
    };

    // Initial Setup and Event Listeners
    selectCenterOfGradient();
    gradientPicker.addEventListener("click", handleGradientClick);
    gradientPicker.addEventListener("touchmove", handleGradientTouchMove);
    lights.forEach((light, index) => {
        light.dataset.id = index + 1;
        light.addEventListener("touchstart", (event) =>
            handleEnter(light, event)
        );

        // Add mouseover event listener to handle drag and click events
        // light.addEventListener("mouseover", (event) => {
        //     if (event.buttons === 1) {
        //         handleEnter(light, event);
        //     }
        // });
        // light.addEventListener("click", (event) =>
        //     handleEnter(light, event)
        // );
    });

    document.addEventListener("keydown", (event) => {
        const keyToLightMap = {
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 6,
            7: 7,
            8: 8,
            9: 9,
            0: 10,
        };

        const lightId = keyToLightMap[event.key];
        if (lightId !== undefined) {
            const light = document.querySelector(
                `.light[data-id="${lightId}"]`
            );
            if (light) {
                handleEnter(light);
            } else {
                console.error(`No light found with ID ${lightId}`);
            }
        }
    });

    content.addEventListener("touchmove", handleTouchMove);
    startButton.addEventListener("click", startAudio);
});
