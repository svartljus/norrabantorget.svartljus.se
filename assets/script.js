document.addEventListener("DOMContentLoaded", () => {
  const gradientPicker = document.getElementById("gradientPicker");
  const colorMarker = document.getElementById("colorMarker");
  const lights = document.querySelectorAll(".light");
  const content = document.querySelector(".content");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const randomColorToggle = document.getElementById("randomColorToggle");

  let activeColor = [255, 0, 0];
  let currentNoteMapping = [];
  let activeLight = null;
  let baseNote = "C4";
  let audioStarted = false;
  let synth = null;
  let ws;

  function connectWebSocket() {
    ws = new WebSocket("wss://sync.possan.codes/broadcast/dendrolux");

    ws.onopen = () => console.log("WebSocket connected");

    ws.onerror = ws.onclose = () => {
      alert(
        "Unfortunately the Dendrolux server is not functional at the moment"
      );
    };
  }

  connectWebSocket();

  const sendWebSocketMessage = (type, id, color) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, id, color }));
    }
  };

  const handleGradientInteraction = (x, y) => {
    const rgbString = getColorAtPosition(x, y, gradientPicker);
    updateActiveColor(rgbString, x, y);
  };

  const randomizeColorMarker = () => {
    const rect = gradientPicker.getBoundingClientRect();
    handleGradientInteraction(
      Math.random() * rect.width,
      Math.random() * rect.height
    );
  };

  const handleEnter = (light) => {
    if (randomColorToggle.checked) randomizeColorMarker();
    const lightId = parseInt(light.dataset.id) - 1;
    const brightnessAdjust =
      lightId < 4 ? 10 * (4 - lightId) : lightId > 5 ? -10 * (lightId - 5) : 0;
    const adjustedColor = activeColor.map((c) =>
      Math.min(
        255,
        Math.max(0, c + Math.round((255 - c) * (brightnessAdjust / 100)))
      )
    );

    setLightBackgroundColor(light, adjustedColor);
    if (audioStarted && currentNoteMapping.length === 10) {
      const note = currentNoteMapping[lightId];
      if (note && synth) synth.triggerAttackRelease(note, "16n");
    }

    setTimeout(() => resetLightBackgroundColor(light), 300);
    sendWebSocketMessage("enter", lightId + 1, adjustedColor);
  };

  const startAudio = () => {
    if (!audioStarted) {
      synth = new Tone.Synth().toDestination();
      Tone.start().then(() => {
        audioStarted = true;
        startScreen.remove();
      });
    }
  };

  const updateActiveColor = (rgbString, x, y) => {
    activeColor = rgbToArray(rgbString);
    updateColorMarker(x, y, rgbString);
    baseNote = getBaseNoteFromPosition(x, gradientPicker.offsetWidth);
    currentNoteMapping = generateLydianScale(baseNote);
  };

  const updateColorMarker = (x, y, color) => {
    Object.assign(colorMarker.style, {
      display: "block",
      left: `${x}px`,
      top: `${y}px`,
      backgroundColor: color,
    });
  };

  const setLightBackgroundColor = (light, color) => {
    light.style.setProperty("--light-bg-color", `rgb(${color.join(", ")})`);
  };

  const resetLightBackgroundColor = (light) => {
    light.style.setProperty("--light-bg-color", "black");
  };

  const rgbToArray = (rgbString) => rgbString.match(/\d+/g).map(Number);

  const getBaseNoteFromPosition = (x, width) => {
    const scale = ["C", "D", "E", "F#", "G", "A", "B"];
    return `${scale[Math.floor((x / width) * scale.length)]}4`;
  };

  const generateLydianScale = (baseNote) => {
    const scaleNotes = ["C", "D", "E", "F#", "G", "A", "B"];
    return Array.from(
      { length: 10 },
      (_, i) =>
        `${
          scaleNotes[(scaleNotes.indexOf(baseNote[0]) + i) % scaleNotes.length]
        }4`
    );
  };

  const getColorAtPosition = (x, y, element) => {
    const canvas = document.createElement("canvas");
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    const ctx = canvas.getContext("2d");
    const style = window.getComputedStyle(element);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    (
      style.backgroundImage.match(/#[0-9a-f]{3,6}|rgb[a]?\([^)]+\)/g) || []
    ).forEach((color, i, arr) =>
      gradient.addColorStop(i / (arr.length - 1), color)
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  };

  gradientPicker.addEventListener("click", (e) => {
    const rect = gradientPicker.getBoundingClientRect();
    handleGradientInteraction(e.clientX - rect.left, e.clientY - rect.top);
  });

  lights.forEach((light, index) => {
    light.dataset.id = index + 1;
    light.addEventListener("touchstart", () => handleEnter(light));
  });

  startButton.addEventListener("click", startAudio);
});
