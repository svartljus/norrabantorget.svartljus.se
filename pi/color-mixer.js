import WebSocket, { WebSocketServer } from "ws";

const RINGS = [
  {
    index: 0,
    delay: 0,
    ip: "192.168.10.101",
  },
  {
    index: 0,
    delay: 200,
    ip: "192.168.10.103",
  },
  {
    index: 0,
    delay: 400,
    ip: "192.168.10.100",
  },
];

const COLOR_PRESET_SPEC =
  '{"on":true,"bri":128,"transition":10,"mainseg":0,"seg":[{"id":0,"start":0,"stop":294,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[255,0,0],[0,0,255]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0},{"id":1,"start":294,"stop":588,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[0,0,0],[0,0,0],[0,0,0]],"fx":0,"sx":128,"ix":128,"pal":0,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0}]}';

const IDLE_PRESET_SPEC =
  '{"on":true,"bri":128,"transition":10,"mainseg":0,"seg":[{"id":0,"start":0,"stop":294,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[255,49,8],[255,99,51],[0,0,0]],"fx":2,"sx":19,"ix":128,"pal":2,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":1},{"id":1,"start":294,"stop":588,"grp":1,"spc":0,"of":0,"on":true,"frz":false,"bri":255,"cct":127,"set":0,"col":[[255,49,8],[255,99,51],[0,0,0]],"fx":2,"sx":19,"ix":128,"pal":2,"c1":128,"c2":128,"c3":16,"sel":true,"rev":false,"mi":false,"o1":false,"o2":false,"o3":false,"si":0,"m12":1},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0},{"stop":0}]}';

const IDLE_PRESET = 10;
const COLOR_PRESET = 11;
const RELAY_SERVER_URL = "wss://sync.possan.codes/broadcast/dendrolux";
const SLOW_FADE_TIME = 2.0;
const QUICK_FADE_TIME = 0.5;
const LIVE_TIMEOUT_TIME = 15000;
const COLOR_SUSTAIN_TIME = 700;

let lightTargetState = "idle";
let lightCurrentState = "off";
let exitLiveDeadline = 0;

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
  })
    .then((r) => r.json())
    .then((r) => {
      console.log("OK");
    })
    .catch((e) => {
      console.log("API error");
    });
}

function configureRingSettings(index, settingsobj) {}

function configureRingPalette(index, paletteindex, paletteobj) {}

async function configureRingPreset(index, presetindex, presetobj) {
  const payload = JSON.parse(presetobj);
  payload.psave = presetindex;
  return _sendStateToRing(index, payload);
}

function _setRingPreset(index, presetIndex) {
  console.log("Set ring preset", index, presetIndex);
  _sendStateToRing(index, { ps: presetIndex });
}

function setRingColor(index, r, g, b, fadetime) {
  console.log("setting ring color in mode", lightCurrentState);
  _sendStateToRing(index, {
    transition: fadetime * 10,
    seg: [{ col: [[r, g, b]] }, { col: [[r, g, b]] }],
  });
}

function setRingModeIdle(index) {
  _setRingPreset(index, IDLE_PRESET);
}

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
      // connectionButtonState[msg._id] = {
      //   ring: ~~msg.id - 1,
      //   color: msg.color,
      //   expires: new Date().getTime() + 10000,
      // };
    }
  }

  //   if (msg.type === "exit") {
  //     // if (msg.id) {
  //     //   if (connectionButtonState[msg._id]) {
  //     //     delete connectionButtonState[msg._id];
  //     //   }
  //     // }
  //   }

  //   if (msg.type === ".disconnect") {
  //     // if (msg._id) {
  //     //   if (connectionButtonState[msg._id]) {
  //     //     delete connectionButtonState[msg._id];
  //     //   }
  //     // }
  //   }

  if (msg.type === "ping") {
    if (msg.id) {
      buttonEvents.push({
        ring: ~~msg.id - 1,
        // color: [0, 0, 0],
        expires: new Date().getTime() + 10000,
      });
      // wake up
      // lightTargetState = "live";
      // should go to live mode
      // connectionButtonState[msg._id] = {
      //   ring: ~~msg.id - 1,
      //   color: [0, 0, 0],
      //   expires: new Date().getTime() + 10000,
      // };
    }
  }
}

function connectToRelay() {
  const ws = new WebSocket(RELAY_SERVER_URL);

  ws.on("error", function error(e) {
    console.error("connection error", e);
    // reconnect?
  });

  ws.on("close", function error(e) {
    console.log("connection closed", e);
    // reconnect?
  });

  ws.on("open", function open() {
    console.log("connection opened.");
  });

  ws.on("message", function message(data) {
    handleRelayMessage(JSON.parse(data));
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
  //   if (
  //     lightTargetState === "idle" &&
  //     (Object.keys(connectionButtonState).length > 0 || buttonEvents.length > 0)
  //   ) {
  //     lightTargetState = "live"; // should go to live mode
  //     console.log("Lights should go to live mode now.");
  //     exitLiveDeadline = new Date().getTime() + LIVE_TIMEOUT_TIME;
  //   }

  if (lightTargetState === "live" && new Date().getTime() > exitLiveDeadline) {
    console.log("Lights should be idle now.");
    lightTargetState = "idle";
  }
}

function updateTargetRingColorsFromState() {
  const T = new Date().getTime();

  //   for (let k = 0; k < ringColorState.length; k++) {
  //     let _r = 0;
  //     let _g = 0;
  //     let _b = 0;
  //     // let any = 0;

  //     // if (buttonEvents.length > 0){
  //     //     let evt = buttonEvents.shift();
  //     //     do {
  //     //         console.log("got event", evt);
  //     //         if (evt.ring === k) {
  //     //             _r = evt.color[0];
  //     //             _g = evt.color[1];
  //     //             _b = evt.color[2];
  //     //             any++;
  //     //         }
  //     //         evt = buttonEvents.shift();
  //     //     } while (evt);
  //     // }

  //     // // for (const id of Object.keys(connectionButtonState)) {
  //     // //   if (connectionButtonState[id].ring === k) {
  //     // //     _r += connectionButtonState[id].color[0];
  //     // //     _g += connectionButtonState[id].color[1];
  //     // //     _b += connectionButtonState[id].color[2];
  //     // //     any++;
  //     // //   }
  //     // // }

  //     // // _r = Math.max(0, Math.min(255, Math.round(_r)));
  //     // // _g = Math.max(0, Math.min(255, Math.round(_g)));
  //     // // _b = Math.max(0, Math.min(255, Math.round(_b)));

  //     // ringColorState[k].any = any > 0;
  //     // if (any) {
  //     //   ringColorState[k].lastActivity = new Date().getTime();
  //     // }
  //     ringColorState[k].targetColor = [_r, _g, _b];
  //   }

  //   for (let k = 0; k < ringColorState.length; k++) {
  //     let _r = 0;
  //     let _g = 0;
  //     let _b = 0;
  //     let any = 0;

  //   if (buttonEvents.length > 0) {
  // let evt = buttonEvents.shift();
  let evt = undefined;
  while ((evt = buttonEvents.shift())) {
    console.log("consumed queued button event", evt);
    if (evt.color && evt.ring !== undefined) {
      ringColorState[evt.ring].targetColor = evt.color;
      ringColorState[evt.ring].expires = T + COLOR_SUSTAIN_TIME;
      // any++;

      lightTargetState = "live"; // should go to live mode
      exitLiveDeadline = new Date().getTime() + LIVE_TIMEOUT_TIME;
    }
    //   evt = buttonEvents.shift();
  }
  //   }

  // for (const id of Object.keys(connectionButtonState)) {
  //   if (connectionButtonState[id].ring === k) {
  //     _r += connectionButtonState[id].color[0];
  //     _g += connectionButtonState[id].color[1];
  //     _b += connectionButtonState[id].color[2];
  //     any++;
  //   }
  // }

  // _r = Math.max(0, Math.min(255, Math.round(_r)));
  // _g = Math.max(0, Math.min(255, Math.round(_g)));
  // _b = Math.max(0, Math.min(255, Math.round(_b)));

  //     ringColorState[k].any = any > 0;
  //     if (any) {
  //       ringColorState[k].lastActivity = new Date().getTime();
  //     }
  //     ringColorState[k].targetColor = [_r, _g, _b];
  //   }

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

function changePresetFromState() {
  if (lightTargetState === "live") {
    if (lightCurrentState !== "fade-to-live" && lightCurrentState !== "live") {
      lightCurrentState = "fade-to-live";

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

      for (var k = 0; k < RINGS.length; k++) {
        setRingModeIdle(k);
      }

      setTimeout(() => {
        lightCurrentState = "idle";
      }, 1000);
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

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init() {
  // configure all presets

  console.log("Dendrolux ring server");
  console.log("");

  console.log("Configuring rings...");
  for (var k = 0; k < RINGS.length; k++) {
    // TODO: configure leds?
    await configureRingPreset(k, IDLE_PRESET, IDLE_PRESET_SPEC);
    await configureRingPreset(k, COLOR_PRESET, COLOR_PRESET_SPEC);
    await setRingModeColor(k);
  }
  console.log("Done.");
  console.log("");

  await delay(2000);

  console.log("Running color test.");
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, 255, 0, 0, 1);
  }
  await delay(1000);
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, 0, 255, 0, 1);
  }
  await delay(1000);
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, 0, 0, 255, 1);
  }
  await delay(1000);
  for (var k = 0; k < RINGS.length; k++) {
    await setRingColor(k, 0, 0, 0, 1);
  }
  console.log("Done.");

  await delay(1000);

  console.log("Starting rings idle mode.");
  for (var k = 0; k < RINGS.length; k++) {
    await setRingModeIdle(k);
  }

  await delay(3000);

  console.log("Start main loop.");
  queueUpdateRingState();

  console.log("Trigger simulated events.");

  handleRelayMessage({
    _id: "dummy1",
    type: "ping",
    id: "1",
  });

  await delay(2000);

  handleRelayMessage({
    _id: "dummy1",
    type: "enter",
    id: "1",
    color: [255, 0, 0],
  });

  handleRelayMessage({
    _id: "dummy2",
    type: "enter",
    id: "2",
    color: [255, 0, 0],
  });
  await delay(2000);

  handleRelayMessage({
    _id: "dummy3",
    type: "enter",
    id: "1",
    color: [0, 255, 0],
  });

  await delay(2000);

  console.log("Connect to messaging server.");
  connectToRelay();
}

init();
