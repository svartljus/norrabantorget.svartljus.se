import WebSocket, { WebSocketServer } from "ws";

// settings

const RINGS = [
  // {...}
  {
    index: 0,
    delay: 0,
    ip: "192.168.1.102",
  },
  {
    index: 0,
    delay: 200,
    ip: "192.168.1.103",
  },
  {
    index: 0,
    delay: 400,
    ip: "192.168.1.104",
  },
];

// const OFF_PRESET = 10;
const IDLE_PRESET = 10;
const COLOR_PRESET = 11;
const RELAY_SERVER_URL = "wss://sync.possan.codes/broadcast/dendrolux";
const SLOW_FADE_TIME = 2.0;
const QUICK_FADE_TIME = 0.2;

let lightTargetState = "idle"; // 'idle' or 'live'
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

let connections = [];

let connectionButtonState = [
  //   {
  //     id: "_1234",
  //     expires: 0,
  //     ring: 0,
  //     color: [255, 0, 0],
  //   },
  //   {
  //     id: "_4567",
  //     expires: new Date().getTime() + 5000,
  //     ring: 0,
  //     color: [0, 255, 0],
  //   },
  //   {
  //     id: "_5678",
  //     expires: new Date().getTime() + 10000,
  //     ring: 1,
  //     color: [0, 0, 255],
  //   },
];

// ring i/o

function _sendStateToRing(index, stateUpdate) {
  const req = JSON.stringify(stateUpdate);
  const ring = RINGS[index];
  console.log("sending state to ring", index, ring?.ip, req);
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
      console.log("API error", e);
    });
}
function configureRingSettings(index, settingsobj) {}

function configureRingPalette(index, paletteindex, paletteobj) {}

function configureRingPreset(index, presetindex, presetobj) {}

function _setRingPreset(index, presetIndex) {
  console.log("Set ring preset", index, presetIndex);
  //   curl -X POST -d '{"ps":10}' -H "Content-Type: application/json" "http://192.168.1.102/json/state"
  _sendStateToRing(index, { ps: presetIndex });
}

function setRingColor(index, r, g, b, fadetime) {
//   console.log("Set ring color", index, [r, g, b], fadetime);
//   ('{"transition":1,"seg":[{"col":[[0,255,0]]},{"col":[[0,255,0]]}]}');
  _sendStateToRing(index, {
    transition: fadetime * 10,
    seg: [{ col: [[r, g, b]] }, { col: [[r, g, b]] }],
  });
}

function setRingModeIdle(index) {
//   console.log("Set ring idle", index);
  _setRingPreset(index, IDLE_PRESET);
}

function setRingModeColor(index) {
//   console.log("Set ring off", index);
     _setRingPreset(index, COLOR_PRESET);
}

// function setRingModeColor(index) {
//   console.log("Set ring off", index);
//   _setRingPreset(index, COLOR_PRESET).then(() => {
//     setRingColor(index, 0, 0, 0);
//   });
// }

// connect to rings

// run self test

// connect to relay

// handle messages from relay

function handleRelayMessage(msg) {
  console.log("got message: " + JSON.stringify(msg));

  // connection received: {"type":"enter","id":"1","color":[0,0,0],"_channel":"dendrolux","_id":"5f086e44-24bc-4aa4-89b3-7aa017837478"}
  // connection received: {"type":".disconnect","_node":-1,"_channel":"dendrolux","_id":"df4fa42f-3ab9-49c5-9270-3761a0fdb26b"}
  // connection received: {"type":".welcome","_channel":"dendrolux","_id":"08427207-403d-4749-9660-ba2450cd9ba8"}
  // connection received: {"type":".disconnect","_node":-1,"_channel":"dendrolux","_id":"b7b04dd8-b651-4afa-9eec-ad7ea97f5588"}

  if (msg.type === "enter") {
    if (msg.id && msg.color) {
      //   colorMixerState[~~msg.id - 1] = msg.color;
      connectionButtonState[msg._id] = {
        ring: ~~msg.id - 1,
        color: msg.color,
        expires: new Date().getTime() + 10000,
      };
    }
  }

  if (msg.type === "exit") {
    if (msg.id) {
      if (connectionButtonState[msg._id]) {
        delete connectionButtonState[msg._id];
      }
    }
  }

  if (msg.type === ".disconnect") {
    if (msg._id) {
      if (connectionButtonState[msg._id]) {
        delete connectionButtonState[msg._id];
      }
    }
  }

  if (msg.type === "ping") {
    if (msg.id) {
      // wake up
      //   lightTargetState = "live"; // should go to live mode
      connectionButtonState[msg._id] = {
        ring: ~~msg.id - 1,
        color: [0, 0, 0],
        expires: new Date().getTime() + 10000,
      };
    }
  }
}

// ping rings

// if more than one user connection

// switch to color mixer mode

// when less than one user connection return to automated program

console.log("Dendrolux ring server");

// first, run ring configuration and self test.

// then connect to relay server

const ws = new WebSocket(RELAY_SERVER_URL);

ws.on("error", function error(e) {
  console.error("connection error", e);
});

ws.on("close", function error(e) {
  console.log("connection closed", e);
});

ws.on("open", function open() {
  console.log("connection opened.");
});

ws.on("message", function message(data) {
  handleRelayMessage(JSON.parse(data));
});

// function sendColorsToRings() {}
// function updateColorMixer() {
//   for (let k = 0; k < colorMixerState.length; k++) {
//     let [_r, _g, _b] = colorMixerState[k];
//     if (_r > 0) {
//       _r -= RGB_FADESPEED;
//     }
//     if (_g > 0) {
//       _g -= RGB_FADESPEED;
//     }
//     if (_b > 0) {
//       _b -= RGB_FADESPEED;
//     }
//     _r = Math.max(0, Math.min(255, Math.round(_r)));
//     _g = Math.max(0, Math.min(255, Math.round(_g)));
//     _b = Math.max(0, Math.min(255, Math.round(_b)));
//     colorMixerState[k] = [_r, _g, _b];
//   }
// }

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
  if (
    lightTargetState === "idle" &&
    Object.keys(connectionButtonState).length > 0
  ) {
    lightTargetState = "live"; // should go to live mode
    console.log("Lights should go to live mode now.");
    exitLiveDeadline = new Date().getTime() + 10000;
  }

  if (lightTargetState === "live" && new Date().getTime() > exitLiveDeadline) {
    console.log("Lights should be idle now.");
    lightTargetState = "idle";
  }
}

function updateTargetRingColorsFromState() {
  for (let k = 0; k < ringColorState.length; k++) {
    let _r = 0;
    let _g = 0;
    let _b = 0;
    let any = 0;

    for (const id of Object.keys(connectionButtonState)) {
      // const D = (new Date()).getTime() -
      if (connectionButtonState[id].ring === k) {
        _r += connectionButtonState[id].color[0];
        _g += connectionButtonState[id].color[1];
        _b += connectionButtonState[id].color[2];
        any++;
      }
    }

    _r = Math.max(0, Math.min(255, Math.round(_r)));
    _g = Math.max(0, Math.min(255, Math.round(_g)));
    _b = Math.max(0, Math.min(255, Math.round(_b)));

    // if (_r > 0 || _g > 0 || _b > 0) {
    //   colorMixerState[k] = [_r, _g, _b];
    // }

    ringColorState[k].any = any > 0;
    if (any) {
      ringColorState[k].lastActivity = new Date().getTime();
    }
    ringColorState[k].targetColor = [_r, _g, _b];
  }
}

function updateRingsFromState() {
  for (let k = 0; k < ringColorState.length; k++) {
    let [_tr, _tg, _tb] = ringColorState[k].targetColor;
    let [_lr, _lg, _lb] = ringColorState[k].liveColor;

    if (_lr != _tr || _lg != _tg || _lb != _tb) {
      // console.log('Ring color changed', k, ringColorState[k])

      if (_tr === 0 && _tg === 0 && _tb === 0) {
        // do slow fade to black
        console.log("slow fade to black", k, ringColorState[k].targetColor);
        setRingColor(k, _tr, _tg, _tb, SLOW_FADE_TIME);
      } else {
        console.log("quick fade to color", k, ringColorState[k].targetColor);
        setRingColor(k, _tr, _tg, _tb, QUICK_FADE_TIME);
      }
      // } else {
      //     console.log('No changed');

      ringColorState[k].liveColor = [_tr, _tg, _tb];
    }

    // ringColorState[k].any = any > 0;
  }
}

function changePresetFromState() {
  if (lightTargetState === lightCurrentState) {
    return;
  }

  if (lightTargetState === "live") {
    lightCurrentState = "live";

    setTimeout(() => {
      for (var k = 0; k < RINGS.length; k++) {
        setRingModeColor(k);
        // RINGS[k].ip
      }
    }, 100);

    // setTimeout(() => {
    //   for (var k = 0; k < RINGS.length; k++) {
    //     setRingModeColor(k, [0, 0, 0]);
    //   }
    // }, 1000);
  } else if (lightTargetState === "idle") {
    lightCurrentState = "idle";

    setTimeout(() => {
      for (var k = 0; k < RINGS.length; k++) {
        // setRingModeOff(k);
        setRingModeIdle(k);
      }
    }, 100);

    // setTimeout(() => {
    //   for (var k = 0; k < RINGS.length; k++) {
    //   }
    // }, 1000);
  }
}
function updateRingState() {
  //   console.log("\nUpdate ring colors");
  evictOldNodes();
  changeLightTargetStateFromConnections();
  updateTargetRingColorsFromState();
  changePresetFromState();
  //   : '+ JSON.stringify(ringColorState))
  updateRingsFromState();

  //   updateColorMixer();

  //   console.log(
  //     "Sending colors: " + JSON.stringify(colorMixerState),
  //     lightTargetState,
  //     connectionButtonState
  //   );
  //   sendColorsToRings();

  queueUpdateRingState();
}

function queueUpdateRingState() {
  setTimeout(() => {
    updateRingState();
  }, 100);
}

queueUpdateRingState(); // start ring loop

// queue some test events.

setTimeout(() => {
  handleRelayMessage({
    _id: "dummy1",
    type: "ping",
    id: "1",
  });
}, 2000);

setTimeout(() => {
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
}, 4000);

setTimeout(() => {
  handleRelayMessage({
    _id: "dummy3",
    type: "enter",
    id: "1",
    color: [0, 255, 0],
  });
}, 6000);

setTimeout(() => {
  handleRelayMessage({ _id: "dummy1", type: "exit", id: "1" });
}, 8000);

setTimeout(() => {
  handleRelayMessage({ _id: "dummy3", type: "exit", id: "1" });
}, 10000);

setTimeout(() => {
  handleRelayMessage({ _id: "dummy2", type: "exit", id: "1" });
}, 12000);
