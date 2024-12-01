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
            alert("Audio context started.");
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
