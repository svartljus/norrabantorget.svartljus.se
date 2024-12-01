document.addEventListener("DOMContentLoaded", () => {
    const lights = document.querySelectorAll(".light");
    const colorSelector = document.getElementById("colorSelector");
  
    // WebSocket setup (stub)
    const ws = new WebSocket("wss://sync.possan.codes/"); // Replace with your WebSocket server URL

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };
  
    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    // Function to send a WebSocket message
    const sendWebSocketMessage = (type, id, color) => {
      const message = {
        type,
        id,
        color, // Send HEX color directly
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket is not open. Message not sent:", message);
      }
    };
  
    // Variable to store the current active color
    let activeColor = colorSelector.value;
  
    // Update the active color dynamically
    colorSelector.addEventListener("input", (event) => {
      activeColor = event.target.value;
    });
  
    // Function to handle entering a light (mouseenter or touchstart)
    const handleEnter = (event) => {
      const light = event.currentTarget;
      const lightId = light.dataset.id || light.textContent.trim();
      console.log(`Entered light ${lightId}`);
      light.style.setProperty("--light-bg-color", activeColor); // Update CSS variable
      sendWebSocketMessage("enter", lightId, activeColor); // Send WebSocket message
    };
  
    // Function to handle exiting a light (mouseleave or touchend)
    const handleExit = (event) => {
      const light = event.currentTarget;
      const lightId = light.dataset.id || light.textContent.trim();
      console.log(`Exited light ${lightId}`);
      light.style.setProperty("--light-bg-color", "transparent"); // Reset CSS variable
      sendWebSocketMessage("exit", lightId, "#000000"); // Send WebSocket message with transparent color
    };
  
    // Add event listeners for both touch and mouse
    lights.forEach((light) => {
      light.addEventListener("mouseenter", handleEnter);
      light.addEventListener("touchstart", handleEnter);
      light.addEventListener("mouseleave", handleExit);
      light.addEventListener("touchend", handleExit);
    });
  });
  