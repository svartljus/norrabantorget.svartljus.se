// Initialize Tone.js Synth
let audioStarted = false;
let synth = null;

const startAudioContext = () => {
    if (!audioStarted) {
        synth = new Tone.Synth().toDestination();
        Tone.start().then(() => {
            console.log("AudioContext started");
            audioStarted = true;
        });
    }
};

// Play a note
const playNote = (note) => {
    if (audioStarted && synth) {
        const currentTime = Tone.now();
        synth.triggerAttackRelease(note, "16n", currentTime);
    } else {
        console.warn("Audio context not started or synth not initialized.");
    }
};
