document.addEventListener("DOMContentLoaded", () => {
    const lights = document.querySelectorAll(".light");
    const colorSelector = document.getElementById("colorSelector");
  
    // Variable to store the current active color
    let activeColor = colorSelector.value;
  
    // Update the active color dynamically
    colorSelector.addEventListener("input", (event) => {
      activeColor = event.target.value;
    });
  
    // Function to handle entering a light (mouseenter or touchstart)
    const handleEnter = (event) => {
      const light = event.currentTarget;
      console.log(`Entered light ${light.textContent}`);
      light.style.setProperty("--light-bg-color", activeColor); // Update CSS variable
    };
  
    // Function to handle exiting a light (mouseleave or touchend)
    const handleExit = (event) => {
      const light = event.currentTarget;
      console.log(`Exited light ${light.textContent}`);
      light.style.setProperty("--light-bg-color", "transparent"); // Reset CSS variable
    };
  
    // Add event listeners for both touch and mouse
    lights.forEach((light) => {
      light.addEventListener("mouseenter", handleEnter);
      light.addEventListener("touchstart", handleEnter);
      light.addEventListener("mouseleave", handleExit);
      light.addEventListener("touchend", handleExit);
    });
  });
  