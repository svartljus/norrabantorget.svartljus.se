let audioStarted = false;
let synth = null;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

startButton.addEventListener("click", function(){
    startAudioContext();
    startScreen.remove();
});

const startAudioContext = () => {
    if (!audioStarted) {
        synth = new Tone.Synth().toDestination();
        Tone.start().then(() => {
            console.log("AudioContext started");
            audioStarted = true;
        });
    }
};

const playNote = (note) => {
    if (audioStarted && synth) {
        const currentTime = Tone.now();
        synth.triggerAttackRelease(note, "16n", currentTime);
    } else {
        console.warn("Audio context not started or synth not initialized.");
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
        const noteOctave = octave + Math.floor((baseNoteIndex + i) / scaleNotes.length);
        notes.push(`${scaleNotes[noteIndex]}${noteOctave}`);
    }
    return notes;
};

// Assign notes to elements based on their data-id
const assignNotesToElements = (baseNote) => {
    const elements = [...document.querySelectorAll("[data-id]")];
    const lydianScale = generateLydianScale(baseNote);

    // Sort elements by data-id (numerical sort)
    elements.sort((a, b) => parseInt(a.dataset.id) - parseInt(b.dataset.id));

    // Reverse the scale to match highest pitches with highest data-id
    const reversedScale = lydianScale.reverse();

    elements.forEach((element, index) => {
        const note = reversedScale[index % reversedScale.length];
        element.dataset.note = note; // Assign the note to the element
        // element.addEventListener("click", () => playNote(note)); // Play note on click
    });
};
// Example of how to call the function with a base note


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
