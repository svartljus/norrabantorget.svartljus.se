document.addEventListener("DOMContentLoaded", () => {
    // Select all light elements and color selector
    const lights = document.querySelectorAll(".light");
    const colorSelector = document.getElementById("colorSelector");
  
    // Variable to store the current active color
    let activeColor = colorSelector.value;
  
    // Update the active color dynamically
    colorSelector.addEventListener("input", (event) => {
      activeColor = event.target.value;
    });
  
    // Add event listeners to each light
    lights.forEach((light) => {
      // Mouseenter or Touchstart event
      light.addEventListener("mouseenter", () => {
        console.log(`Entered light ${light.textContent}`);
        light.style.setProperty("--light-bg-color", activeColor); // Update CSS variable
      });
  
      // Mouseleave or Touchend event
      light.addEventListener("mouseleave", () => {
        console.log(`Exited light ${light.textContent}`);
        light.style.setProperty("--light-bg-color", "transparent"); // Reset CSS variable
      });
  
      // For touch devices (add touchstart and touchend)
      light.addEventListener("touchstart", () => {
        console.log(`Entered light ${light.textContent}`);
        light.style.setProperty("--light-bg-color", activeColor); // Update CSS variable
      });
  
      light.addEventListener("touchend", () => {
        console.log(`Exited light ${light.textContent}`);
        light.style.setProperty("--light-bg-color", "transparent"); // Reset CSS variable
      });
    });
  });
  