const presets = {
    DEFAULT: {
      name: "Bright Green Effect",
      on: true,
      bri: 128,
      transition: 7,
      mainseg: 0,
      seg: [
        {
          id: 0,
          start: 0,
          stop: 294,
          grp: 1,
          spc: 0,
          col: [[17, 255, 0], [0, 0, 0], [0, 0, 0]],
          fx: 2,
          sx: 20,
          ix: 128,
          pal: 0,
        },
        {
          id: 1,
          start: 294,
          stop: 588,
          grp: 1,
          spc: 0,
          col: [[17, 255, 0], [0, 0, 0], [0, 0, 0]],
          fx: 2,
          sx: 20,
          ix: 128,
          pal: 0,
        },
      ],
    },
    OFF: {
      name: "OFF",
      on: false, // Turns the lights off
      bri: 0,    // Sets brightness to 0 for safety
    },
    // Add more presets as needed
  };
  
  export default presets;
  