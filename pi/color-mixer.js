import WebSocket from "ws";

const DELAYOFFSET = 500;

const RINGS = [
  {
    index: 1,
    delay: 1 + DELAYOFFSET * 0,
    ip: "192.168.1.201",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 2,
    delay: 1 + DELAYOFFSET * 1,
    ip: "192.168.1.202",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 3,
    delay: 1 + DELAYOFFSET * 2,
    ip: "192.168.1.203",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 4,
    delay: 1 + DELAYOFFSET * 3,
    ip: "192.168.1.204",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 5,
    delay: 1 + DELAYOFFSET * 4,
    ip: "192.168.1.205",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 6,
    delay: 1 + DELAYOFFSET * 5,
    ip: "192.168.1.206",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 7,
    delay: 1 + DELAYOFFSET * 6,
    ip: "192.168.1.207",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 8,
    delay: 1 + DELAYOFFSET * 7,
    ip: "192.168.1.208",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 9,
    delay: 1 + DELAYOFFSET * 8,
    ip: "192.168.1.209",
    errorCount: 0,
    lastError: 0,
  },
  {
    index: 10,
    delay: 1 + DELAYOFFSET * 9,
    ip: "192.168.1.210",
    errorCount: 0,
    lastError: 0,
  },
];

const OFF_PRESET_SPEC =
  '{"on":true,"bri":128,"transition":10,"mainseg":0,"seg":[{"id":0,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[0,0,0],[0,0,0]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0},{"id":1,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[0,0,0],[0,0,0]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0}]}';
const COLOR_PRESET_SPEC =
  '{"on":true,"bri":128,"transition":10,"mainseg":0,"seg":[{"id":0,"start":0,"stop":320,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[0,0,0],[0,0,0]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0},{"id":1,"start":320,"stop":640,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[0,0,0],[0,0,0]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0}]}';

const OFF_PRESET = 1;
const COLOR_PRESET = 11;
const RELAY_SERVER_URL = "wss://sync.possan.codes/broadcast/dendrolux";
const SLOW_FADE_TIME = 2.0;
const BREATHE_IN_FADE_TIME = 1.5;
const BREATHE_OUT_FADE_TIME = 3.0;
const BREATHE_INTERVAL = 6000;
const QUICK_FADE_TIME = 0.5;
const LIVE_TIMEOUT_TIME = 15000;
const COLOR_SUSTAIN_TIME = 700;

let lightTargetState = "idle";
let lightCurrentState = "off";
let exitLiveDeadline = 0;
let startTime = 0;
let connectionErrors = 0;

let ringColorState = [
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
  {
    targetColor: [100, 50, 0],
    liveColor: [100, 50, 0],
    lastActivity: 0,
    any: false,
  },
];

let connectionButtonState = [];
let buttonEvents = [];

function _sendStateToRing(index, stateUpdate) {
  const req = JSON.stringify(stateUpdate);
  const ring = RINGS[index];
  console.log("> sending state to ring", index, ring?.ip, req);
  if (!ring) {
    return;
  }
  const url = `http://${ring.ip}/json/state`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: req,
    signal: AbortSignal.timeout(2000),
  })
    .then((r) => r.json())
    .then((r) => {})
    .catch((e) => {
      ring.errorCount++;
      ring.lastError = new Date().getTime();
      console.log(
        "! api call failed for " + ring.ip + " (" + ring.errorCount + " errors)"
      );
    });
}

async function configureRingPreset(index, presetindex, presetobj) {
  const payload = JSON.parse(presetobj);
  payload.psave = presetindex;
  return _sendStateToRing(index, payload);
}

function _setRingPreset(index, presetIndex) {
  let time = Math.floor(new Date().getTime() / 1000);
  time -= index * 2000;

  console.log("Set ring preset", index, presetIndex, time);
  _sendStateToRing(index, { ps: presetIndex, time });
}

function setRingColor(index, r, g, b, fadetime) {
  // console.log("setting ring color in mode", lightCurrentState);
  _sendStateToRing(index, {
    transition: fadetime * 10,
    seg: [{ col: [[r, g, b]] }, { col: [[r, g, b]] }],
  });
}

function getBreatheInColor() {
  let r1 = Math.round(255 + Math.random() * 0);
  let g1 = Math.round(140 + Math.random() * 0);
  let b1 = Math.round(50 + Math.random() * 0);
  return [r1, g1, b1];
}

function getBreatheOutColor() {
  let r1 = Math.round(80 + Math.random() * 0);
  let g1 = Math.round(30 + Math.random() * 0);
  let b1 = Math.round(0);
  return [r1, g1, b1];
}

function setRingColorBreatheIn(index) {
  const c = getBreatheInColor();
  setRingColor(index, c[0], c[1], c[2], BREATHE_IN_FADE_TIME);
}

function setRingColorBreatheOut(index) {
  const c = getBreatheOutColor();
  setRingColor(index, c[0], c[1], c[2], BREATHE_OUT_FADE_TIME);
}

// function setRingModeIdle(index) {
//   _setRingPreset(index, IDLE_PRESET);
// }

function setRingModeColor(index) {
  _setRingPreset(index, COLOR_PRESET);
}

function handleRelayMessage(msg) {
  console.log("got message: " + JSON.stringify(msg));

  // connection received: {"type":"enter","id":"1","color":[0,0,0],"_channel":"dendrolux","_id":"5f086e44-24bc-4aa4-89b3-7aa017837478"}
  // connection received: {"type":".disconnect","_node":-1,"_channel":"dendrolux","_id":"df4fa42f-3ab9-49c5-9270-3761a0fdb26b"}
  // connection received: {"type":".welcome","_channel":"dendrolux","_id":"08427207-403d-4749-9660-ba2450cd9ba8"}
  // connection received: {"type":".disconnect","_node":-1,"_channel":"dendrolux","_id":"b7b04dd8-b651-4afa-9eec-ad7ea97f5588"}

  if (msg.type === "enter") {
    if (msg.id && msg.color) {
      buttonEvents.push({
        ring: ~~msg.id - 1,
        color: msg.color,
        expires: new Date().getTime() + 10000,
      });
    }
  }

  if (msg.type === "ping") {
    if (msg.id) {
      buttonEvents.push({
        ring: ~~msg.id - 1,
        expires: new Date().getTime() + 10000,
      });
    }
  }
}

let ws = undefined;

function queueReconnect() {
  console.log("Queueing re-connect...");
  setTimeout(connectToRelay, 5000);
}

function connectToRelay() {
  ws = new WebSocket(RELAY_SERVER_URL);

  ws.on("error", function error(e) {
    console.error("connection error", e);
    connectionErrors++;
    ws = undefined;
  });

  ws.on("close", function error(e) {
    console.log("connection closed", e);
    ws = undefined;
    queueReconnect();
  });

  ws.on("open", function open() {
    console.log("connection opened.");
  });

  ws.on("message", function message(data) {
    if (ws) {
      handleRelayMessage(JSON.parse(data));
    }
  });
}

function evictOldNodes() {
  for (const id of Object.keys(connectionButtonState)) {
    const D = new Date().getTime() - connectionButtonState[id].expires;
    if (D > 1) {
      console.log("Evict id", id, D);
      delete connectionButtonState[id];
    }
  }
}

function changeLightTargetStateFromConnections() {
  if (lightTargetState === "live" && new Date().getTime() > exitLiveDeadline) {
    console.log("Lights should be idle now.");
    lightTargetState = "idle";
  }
}

function updateTargetRingColorsFromState() {
  const T = new Date().getTime();

  let evt = undefined;
  while ((evt = buttonEvents.shift())) {
    console.log("consumed queued button event", evt);
    if (evt.color && evt.ring !== undefined) {
      ringColorState[evt.ring].targetColor = evt.color;
      ringColorState[evt.ring].expires = T + COLOR_SUSTAIN_TIME;
      lightTargetState = "live"; // should go to live mode
      exitLiveDeadline = new Date().getTime() + LIVE_TIMEOUT_TIME;
    }
  }

  for (let k = 0; k < ringColorState.length; k++) {
    if (ringColorState[k].expires && ringColorState[k].expires < T) {
      ringColorState[k].targetColor = [0, 0, 0];
      ringColorState[k].expires = undefined;
    }
  }
}

function updateRingsFromState() {
  for (let k = 0; k < ringColorState.length; k++) {
    let [_tr, _tg, _tb] = ringColorState[k].targetColor;
    let [_lr, _lg, _lb] = ringColorState[k].liveColor;

    if (_lr != _tr || _lg != _tg || _lb != _tb) {
      if (_tr === 0 && _tg === 0 && _tb === 0) {
        console.log("slow fade to black", k, ringColorState[k].targetColor);
        setRingColor(k, _tr, _tg, _tb, SLOW_FADE_TIME);
      } else {
        console.log("quick fade to color", k, ringColorState[k].targetColor);
        setRingColor(k, _tr, _tg, _tb, QUICK_FADE_TIME);
      }

      ringColorState[k].liveColor = [_tr, _tg, _tb];
    }
  }
}

let breathingState = 0;
let breathingTimer = 0;

function startBreatheTimer() {
  breathingState = 0;
  breathingTimer = setInterval(() => {
    if (breathingState) {
      for (var k = 0; k < RINGS.length; k++) {
        setTimeout(setRingColorBreatheOut.bind(this, k), RINGS[k].delay);
      }
    } else {
      for (var k = 0; k < RINGS.length; k++) {
        setTimeout(setRingColorBreatheIn.bind(this, k), RINGS[k].delay);
      }
    }
    breathingState = !breathingState;
  }, BREATHE_INTERVAL);
}

function changePresetFromState() {
  if (lightTargetState === "live") {
    if (lightCurrentState !== "fade-to-live" && lightCurrentState !== "live") {
      lightCurrentState = "fade-to-live";

      clearInterval(breathingTimer);

      for (var k = 0; k < RINGS.length; k++) {
        setRingModeColor(k);
      }

      setTimeout(() => {
        lightCurrentState = "live";
      }, 2000);
    }
  } else if (lightTargetState === "idle") {
    if (lightCurrentState !== "fade-to-idle" && lightCurrentState !== "idle") {
      lightCurrentState = "fade-to-idle";

      startBreatheTimer();

      setTimeout(() => {
        lightCurrentState = "idle";
      }, 13000);
    }
  }
}

function updateRingState() {
  evictOldNodes();
  changeLightTargetStateFromConnections();
  updateTargetRingColorsFromState();
  changePresetFromState();
  updateRingsFromState();
  queueUpdateRingState();
}

function queueUpdateRingState() {
  setTimeout(() => {
    updateRingState();
  }, 100);
}

function reportErrors() {
  const T = new Date().getTime();

  const uptime = T - startTime;

  const errorStats = {
    type: "error-stats",
    uptime,
    startTime,
    connectionErrors,
    ringErrors: [],
  };

  for (var k = 0; k < RINGS.length; k++) {
    const r = RINGS[k];
    if (r.errorCount > 0) {
      errorStats.ringErrors.push({
        ip: r.ip,
        errors: r.errorCount,
        sinceLast: Math.max(0, T - r.lastError),
      });
    }
  }

  console.log("Send error stats: " + JSON.stringify(errorStats));
  if (ws) {
    ws.send(JSON.stringify(errorStats));
  }
}

function startErrorReporter() {
  setInterval(reportErrors, 10000);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init() {
  // configure exit handlers

  startTime = new Date().getTime();

  process.stdin.resume(); // so the program will not close instantly

  async function exitHandler(options, exitCode) {
    console.log("in Exit handler, fading out lights...", options, exitCode);

    // for (var k = 0; k < RINGS.length; k++) {
    //   await setRingModeColor(k);
    // }

    // await delay(3000);

    for (var k = 0; k < RINGS.length; k++) {
      await setRingColor(k, 0, 0, 0, 1);
    }

    await delay(3000);

    for (var k = 0; k < RINGS.length; k++) {
      await setRingColor(k, 0, 0, 0, 1);
    }

    await delay(1000);

    console.log("lights should be off now.");

    if (options.exit) {
      process.exit();
    }
  }

  // do something when app is closing
  process.on("exit", exitHandler.bind(null, { cleanup: true }));

  // catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  process.on("SIGTERM", exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

  // configure all presets

  console.log("Dendrolux ring server");
  console.log("");

  startErrorReporter();

  let t1 = 4; //  Math.round(10 + Math.random() * 1);

  console.log("Configuring rings...");

  for (var k = 0; k < RINGS.length; k++) {
    const parsed3 = JSON.parse(OFF_PRESET_SPEC);
    parsed3.seg[0].sx = t1;
    parsed3.seg[1].sx = t1;
    parsed3.seg[0].grp = k + 1;
    parsed3.seg[1].grp = k + 1;
    configureRingPreset(k, OFF_PRESET, JSON.stringify(parsed3));
    await delay(500);
  }

  await delay(3000);

  for (var k = 0; k < RINGS.length; k++) {
    const parsed2 = JSON.parse(COLOR_PRESET_SPEC);
    parsed2.seg[0].sx = t1;
    parsed2.seg[1].sx = t1;
    parsed2.seg[0].grp = k + 1;
    parsed2.seg[1].grp = k + 1;
    configureRingPreset(k, COLOR_PRESET, JSON.stringify(parsed2));
    await delay(500);
  }

  await delay(3000);

  // sync time
  console.log("Sync time...");
  const time = Math.floor(new Date().getTime() / 1000);
  for (var k = 0; k < RINGS.length; k++) {
    _sendStateToRing(k, { time: time - k * 3000 });
  }

  console.log("Set color mode...");
  for (var k = 0; k < RINGS.length; k++) {
    await setRingModeColor(k);
  }

  console.log("Done.");
  console.log("");

  await delay(2000);

  console.log("Running color test.");
  const c1 = getBreatheInColor();
  const c2 = getBreatheOutColor();
  // for (var k = 0; k < RINGS.length; k++) {
  //   await setRingColor(k, 255, 0, 0, 1);
  // }
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, c1[0], c1[1], c1[2], BREATHE_IN_FADE_TIME);
  }
  await delay(10000);
  // for (var k = 0; k < RINGS.length; k++) {
  //   await setRingColor(k, 0, 255, 0, 1);
  // }
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, c2[0], c2[1], c2[2], BREATHE_OUT_FADE_TIME);
  }
  await delay(5000);
  // for (var k = 0; k < RINGS.length; k++) {
  //   await setRingColor(k, 0, 0, 255, 1);
  // }
  // await delay(2000);
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, 0, 0, 0, 1);
  }

  console.log("Done.");
  await delay(2000);

  console.log("Start main loop.");
  queueUpdateRingState();

  await delay(1000);

  console.log("Connect to messaging server.");
  connectToRelay();
}

init();
