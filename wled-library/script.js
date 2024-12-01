// WLED API Library
const WLED = {
    devices: {
      light1: '192.168.1.102',
      light2: '192.168.1.103',
      light3: '192.168.1.104',
      light4: '192.168.1.105',
      light5: '192.168.1.106',
      light6: '192.168.1.107',
      light7: '192.168.1.108',
      light8: '192.168.1.109',
      light9: '192.168.1.110',
      light10: '192.168.1.111',
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
  
    /**
     * Trigger a custom preset.
     * @param {string} ipAddress - The IP address of the WLED device.
     * @param {Object} presetData - The JSON payload for the custom preset.
     */
    triggerPreset: function (ipAddress, presetData) {
      return this.sendRequest(ipAddress, presetData);
    },
  
    /**
     * Switch to a preset by its ID.
     * @param {string} ipAddress - The IP address of the WLED device.
     * @param {number} presetId - The ID of the preset to activate.
     */
    switchPreset: function (ipAddress, presetId) {
      return this.sendRequest(ipAddress, { ps: presetId });
    },
  
    /**
     * Turn off a WLED device.
     * @param {string} ipAddress - The IP address of the WLED device.
     */
    turnOff: function (ipAddress) {
      return this.sendRequest(ipAddress, { on: false });
    },
  
    /**
     * Turn on a WLED device.
     * @param {string} ipAddress - The IP address of the WLED device.
     */
    turnOn: function (ipAddress) {
      return this.sendRequest(ipAddress, { on: true });
    },
  
    /**
     * Get the current state of a WLED device.
     * @param {string} ipAddress - The IP address of the WLED device.
     * @returns {Promise} - Resolves with the current state JSON, rejects on failure.
     */
    getCurrentState: function (ipAddress) {
      return fetch(`http://${ipAddress}/json/state`)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error(`Failed to fetch state from ${ipAddress}`);
        });
    },
  };
  