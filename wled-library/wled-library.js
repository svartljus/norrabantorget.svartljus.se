import presets from './presets.js';

const WLED = {
  devices: {
    light1: { ip: '192.168.1.102', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light2: { ip: '192.168.1.103', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light3: { ip: '192.168.1.104', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light4: { ip: '192.168.1.105', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light5: { ip: '192.168.1.106', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light6: { ip: '192.168.1.107', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light7: { ip: '192.168.1.108', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light8: { ip: '192.168.1.109', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light9: { ip: '192.168.1.110', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
    light10: { ip: '192.168.1.111', segments: [{ start: 0, stop: 280 }, { start: 280, stop: 560 }] },
  },

  /**
   * Initialize all devices with their predefined segments and save presets.
   */
  initializeDevices: async function () {
    let presetId = 10; // Start saving presets from ID 10

    for (const deviceName in this.devices) {
      const device = this.devices[deviceName];

      // Construct the segment payload
      const segmentData = device.segments.map((segment, index) => ({
        id: index,
        start: segment.start,
        stop: segment.stop,
        grp: 1, // Grouping
        spc: 0, // Spacing
      }));

      // Payload for initialization
      const initPayload = {
        on: true,
        seg: segmentData,
      };

      // Initialize device segments
      try {
        await this.sendRequest(device.ip, initPayload);
        console.log(`${deviceName} initialized with segments.`);
      } catch (error) {
        console.error(`Error initializing ${deviceName}: ${error.message}`);
      }

      // Save all presets
      for (const [key, preset] of Object.entries(presets)) {
        const savePresetPayload = {
          psave: presetId++, // Increment preset ID
          ...preset,
        };

        try {
          await this.sendRequest(device.ip, savePresetPayload);
          console.log(`${key} saved on ${deviceName} with ID ${presetId - 1}.`);
        } catch (error) {
          console.error(`Error saving ${key} on ${deviceName}: ${error.message}`);
        }
      }
    }
  },

  /**
   * Generic function to send a POST request to a WLED device.
   * @param {string} ipAddress - The IP address of the WLED device.
   * @param {Object} data - The JSON payload for the request.
   * @returns {Promise} - Resolves if successful, rejects on failure.
   */
  sendRequest: function (ipAddress, data) {
    return fetch(`http://${ipAddress}/json/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(response => {
      if (response.ok) return response.json();
      throw new Error(`Failed to communicate with ${ipAddress}`);
    });
  },
};

export default WLED;
