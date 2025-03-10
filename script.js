history.scrollRestoration = "manual"; // Prevent automatic scroll restoration
window.onload = function () {
  setTimeout(() => {
    window.scrollTo(0, 0); // Reset scroll position after a short delay
  }, 100); // Adjust the delay as needed
};

// Create an array of canvas elements
const canvases = [
  document.getElementById("waterLiliesCanvas"),
  document.getElementById("waterLiliesCanvas2"),
  document.getElementById("waterLiliesCanvas3"),
  document.getElementById("waterLiliesCanvas4"),
];

// Create contexts for each canvas with willReadFrequently set to true for better performance
const contexts = canvases.map((canvas) =>
  canvas.getContext("2d", { willReadFrequently: true })
);

// Video elements
const backgroundVideo = document.querySelector("#backgroundVideo");
const transitionVideo = document.querySelector("#middle-1"); // Going underwater video
const loopingVideo = document.querySelector("#middle-2"); // Get the looping video
const endVideo = document.querySelector("#end"); // End video

// Video control variables
let lastScrollPosition = window.scrollY;
let isScrollingDown = true;
let hasReachedTransition = false;
let hasReachedBottom = false;
let hasReachedEnd = false;
const FADE_DURATION = 0.5; // Duration of fade transition in seconds

// Animation variables
let time = 0;
let totalDistance = 0;
const RIVER_FLOW_SPEED = 0.7;
let flowDirection = 1;

// Mouse event handling variables
let currentSection1Progress = 0;
let firstSectionLotusClicked = false;
let nextTraceIndex = 0;

// Load lotus image
const lotusImage = new Image();
lotusImage.src = "img/lotus.png";

// Load success audio
const successAudio = new Audio("audio/success.mp3");
successAudio.volume = 0.4;

// Load section audio
const startAudio = new Audio("audio/start.mp3");
const transitionAudio = new Audio("audio/transition.mp3");
const loopingSectionAudio = new Audio("audio/looping-section.mp3");
const sirenAudio = new Audio("audio/end.mp3");
let isInFinalScene = false;

// Set audio to loop
startAudio.loop = true;
startAudio.volume = 0.7;
transitionAudio.loop = true;
loopingSectionAudio.loop = true;
loopingSectionAudio.volume = 0.6;
sirenAudio.loop = true;
sirenAudio.volume = 0.7;

// Initialize styles
canvases.forEach((canvas, index) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = index === 3 ? 15 : 10 + index;
  canvas.style.pointerEvents = "all";
  canvas.style.opacity = index === 0 ? 1 : 0;
  canvas.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
});

[backgroundVideo, transitionVideo, loopingVideo, endVideo].forEach(
  (video, index) => {
    if (video) {
      video.style.position = "fixed";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.zIndex = index === 3 ? 14 : index + 1;
      video.style.pointerEvents = "none";
    }
  }
);

// Set initial states for videos
if (transitionVideo) {
  transitionVideo.pause();
  transitionVideo.currentTime = 0;
  transitionVideo.style.opacity = "0";
  transitionVideo.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
}
if (loopingVideo) {
  loopingVideo.loop = true;
  loopingVideo.muted = true;
  loopingVideo.currentTime = 0;
  loopingVideo.style.opacity = "0";
  loopingVideo.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
}
if (endVideo) {
  endVideo.pause();
  endVideo.currentTime = 0;
  endVideo.style.opacity = "0";
  endVideo.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
}

// Function to show the overlay
function showOverlay() {
  document.body.classList.add("no-scroll");
  startAudio.pause();
}

// Function to hide the overlay
function hideOverlay() {
  const overlay = document.getElementById("overlay");
  const lotusImage = document.getElementById("lotusImage");
  lotusImage.classList.remove("bounce");

  overlay.classList.add("shrink");

  setTimeout(() => {
    document.body.removeChild(overlay);
    document.body.classList.remove("no-scroll");
    startAudio.play();
  }, 3000);
}

// Add click event listener to the overlay
document.getElementById("lotusImage").addEventListener("click", () => {
  successAudio.play();
  hideOverlay();
});

// Show the overlay when the page loads
window.addEventListener("load", showOverlay);

// Swimming text array
const monet_sentences = [
  "Recognized as the 'Father of Impressionism', Claude Monet instigated one of the most important artistic movements in history.",
  "Impressionism broke from convention and showed artists a new way to develop techniques.",
  "Monet wasn't satisfied with this approach and began to paint outside.",
  "The light enhanced the works and gave Monet's paintings a photographic quality.",
  "His tireless investigation of light on a given subject is charted throughout his series paintings.",
  "Monet's creativity never wavered despite a great amount of personal tragedy.",
  "He recorded his surroundings faithfully, from the grime of a Paris railway station.",
  "The artist's emotions and psychological state are revealed in his bold flurry of colors.",
  "My only merit lies in having painted directly in front of nature.",
  "The discoveries he made through his paintings illuminated nature for the rest of us.",
];

let swimmingTexts = [];

// Function to initialize swimming texts
function initializeSwimmingTexts() {
  swimmingTexts = monet_sentences.map((text, index) => ({
    text,
    x: window.innerWidth * (0.2 + Math.random() * 0.6),
    y: window.innerHeight * (0.1 + index * 0.08),
    angle: 0,
    scale: 1,
    fontSize: 12 + Math.random() * 8,
    fontFamily: "Times New Roman",
    speed: 1 + Math.random(),
    amplitude: 20 + Math.random() * 10,
    frequency: 0.2 + Math.random() * 0.2,
    waveSpeed: 0.02 + Math.random() * 0.1,
    moveDirection: Math.random() < 0.5 ? 0 : Math.PI,
    time: Math.random() * Math.PI * 2,
    update() {
      this.time += this.waveSpeed;
      this.x += Math.cos(this.moveDirection) * this.speed;

      const padding = 200;
      if (this.x < padding || this.x > window.innerWidth - padding) {
        this.moveDirection = this.moveDirection === 0 ? Math.PI : 0;
        this.x = Math.max(
          padding,
          Math.min(window.innerWidth - padding, this.x)
        );
      }
    },
    draw(ctx) {
      ctx.save();
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const chars = this.text.split("");
      const totalWidth = ctx.measureText(this.text).width;
      let currentX = -totalWidth / 2;

      chars.forEach((char, i) => {
        const charWidth = ctx.measureText(char).width;
        const centerX = currentX + charWidth / 2;

        const waveOffset = (i / chars.length) * Math.PI * 2;
        const yOffset = Math.sin(this.time + waveOffset) * this.amplitude;
        const rotationAngle = Math.cos(this.time + waveOffset) * 0.3;

        const opacity =
          0.2 + (Math.sin(this.time + waveOffset) * 0.5 + 0.5) * 0.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        ctx.save();
        ctx.translate(this.x + centerX, this.y + yOffset);
        ctx.rotate(rotationAngle);

        const scale = 1 + Math.sin(this.time + waveOffset) * 0.1;
        ctx.scale(scale, scale);

        ctx.fillText(char, 0, 0);
        ctx.restore();

        currentX += charWidth;
      });

      ctx.restore();
    },
  }));
}

// Load additional images with multiple instances
const additionalImages = [];
for (let i = 1; i <= 5; i++) {
  const img = new Image();
  img.src = `img/${i}.png`;
  // Create 5 to 10 instances of each image randomly
  const instances = 5 + Math.floor(Math.random() * 6);
  for (let j = 0; j < instances; j++) {
    additionalImages.push(img);
  }
}

// Create floating object class
class FloatingObject {
  constructor(image) {
    this.image = image;
    this.x =
      window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.8);
    this.y =
      window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.6);
    this.scale = 0.25;
    this.speed = 2.9;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = 0.01 + Math.random() * 0.02;
    this.moveDirection = Math.random() * Math.PI * 2;
    this.opacity = 0.3 + Math.random() * 0.7;
    this.targetOpacity = 1;
    this.isHovered = false;
    this.isClicked = false;
  }

  isPointInside(x, y) {
    const scaledWidth = this.image.width * this.scale;
    const scaledHeight = this.image.height * this.scale;
    const dx = x - this.x;
    const dy = y - this.y;

    // Account for rotation
    const rotatedDx = dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
    const rotatedDy = dx * Math.sin(-this.angle) + dy * Math.cos(-this.angle);

    return (
      Math.abs(rotatedDx) < scaledWidth / 2 &&
      Math.abs(rotatedDy) < scaledHeight / 2
    );
  }

  draw(ctx) {
    if (!this.image.complete) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Scale based on lotus dimensions
    if (this.image !== lotusImage && lotusImage.complete) {
      const scaleX = lotusImage.width / this.image.width;
      const scaleY = lotusImage.height / this.image.height;
      ctx.scale(this.scale * scaleX, this.scale * scaleY);
    } else {
      ctx.scale(this.scale, this.scale);
    }

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
    ctx.restore();
  }

  update() {
    // Move in current direction
    this.x += Math.cos(this.moveDirection) * this.speed;
    this.y += Math.sin(this.moveDirection) * this.speed;

    // Check boundaries and bounce
    const padding = 100;
    if (this.x < padding || this.x > window.innerWidth - padding) {
      this.moveDirection = Math.PI - this.moveDirection;
      this.x = Math.max(padding, Math.min(window.innerWidth - padding, this.x));
    }
    if (this.y < padding || this.y > window.innerHeight - padding) {
      this.moveDirection = -this.moveDirection;
      this.y = Math.max(
        padding,
        Math.min(window.innerHeight - padding, this.y)
      );
    }

    // Continuous rotation
    this.angle += this.rotationSpeed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

    // Random opacity changes
    if (Math.random() < 0.01) {
      this.targetOpacity = 0.3 + Math.random() * 0.7;
    }
    this.opacity += (this.targetOpacity - this.opacity) * 0.05;
  }
}

// Create array of floating objects
const floatingObjects = [
  new FloatingObject(lotusImage), // Original lotus
  ...additionalImages.map((img) => new FloatingObject(img)), // Additional images
];

// Lotus position
const randomLotusPosition = {
  x: window.innerWidth * 0.3 + Math.random() * (window.innerWidth * 0.4),
  y: window.innerHeight * 0.6 + Math.random() * (window.innerHeight * 0.3),
  scale: 0.25 + Math.random() * 0.15,
  originalX: 0,
  originalY: 0,
};
randomLotusPosition.originalX = randomLotusPosition.x;
randomLotusPosition.originalY = randomLotusPosition.y;

// Swimming lotus
const swimmingLotus = {
  x: window.innerWidth * 0.3 + Math.random() * (window.innerWidth * 0.4),
  y: window.innerHeight * 0.6 + Math.random() * (window.innerHeight * 0.3),
  scale: 0.25 + Math.random() * 0.15,
  speed: 2,
  angle: 0,
  rotationSpeed: 0.02,
  moveDirection: Math.random() * Math.PI * 2, // Random initial direction in radians
  opacity: 1,
  targetOpacity: 1,
  update() {
    // Move in current direction
    this.x += Math.cos(this.moveDirection) * this.speed;
    this.y += Math.sin(this.moveDirection) * this.speed;

    // Check boundaries and bounce
    const padding = 100; // Keep some distance from the edges
    if (this.x < padding || this.x > window.innerWidth - padding) {
      this.moveDirection = Math.PI - this.moveDirection; // Reverse x direction
      this.x = Math.max(padding, Math.min(window.innerWidth - padding, this.x));
    }
    if (this.y < padding || this.y > window.innerHeight - padding) {
      this.moveDirection = -this.moveDirection; // Reverse y direction
      this.y = Math.max(
        padding,
        Math.min(window.innerHeight - padding, this.y)
      );
    }

    // Continuous rotation
    this.angle += this.rotationSpeed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

    // Random opacity changes
    if (Math.random() < 0.01) {
      // 1% chance each frame to change opacity target
      this.targetOpacity = 0.3 + Math.random() * 0.7; // Range from 0.3 to 1.0
    }
    this.opacity += (this.targetOpacity - this.opacity) * 0.05;
  },
};

// End section lotus
const endSectionLotus = {
  x: window.innerWidth * 0.3 + Math.random() * (window.innerWidth * 0.4),
  y:
    window.innerHeight * 0.5 +
    (Math.random() - 0.5) * (window.innerHeight * 0.1), // Centered vertically with small variation
  scale: 0.05,
  speed: 5,
  angle: 0,
  rotationSpeed: 0.03,
  moveDirection: Math.random() < 0.5 ? 0 : Math.PI, // Start moving either left or right
  verticalOffset: 0,
  verticalSpeed: 0.02, // Speed of up/down movement
  opacity: 0.6,
  fadeSpeed: 0.01,
  fadeDirection: 1,
  isClicked: false,
  update() {
    // Primarily horizontal movement
    this.x += Math.cos(this.moveDirection) * this.speed;

    // Gentle vertical oscillation
    this.verticalOffset += this.verticalSpeed;
    this.y = window.innerHeight * 0.5 + Math.sin(this.verticalOffset) * 20; // 20px up/down movement

    // Bounce off horizontal boundaries
    const padding = 50;
    if (this.x < padding || this.x > window.innerWidth - padding) {
      this.moveDirection = this.moveDirection === 0 ? Math.PI : 0; // Switch between left and right
      this.x = Math.max(padding, Math.min(window.innerWidth - padding, this.x));
    }

    // Continuous rotation
    this.angle += this.rotationSpeed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

    // Smooth opacity fade in/out between 0.2 and 1.0
    this.opacity += this.fadeSpeed * this.fadeDirection;
    if (this.opacity >= 1.0) {
      this.opacity = 0.7;
      this.fadeDirection = -1;
    } else if (this.opacity <= 0.2) {
      this.opacity = 0.2;
      this.fadeDirection = 1;
    }
  },
};

// Ripple effect
const ripples = [];
const MAX_RIPPLES = 3;
const RIPPLE_LIFETIME = 30;
const RIPPLE_RADIUS = 70;
const RIPPLE_STRENGTH = 80;

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
  }

  update() {
    this.age++;
    return this.age < RIPPLE_LIFETIME;
  }

  getStrength() {
    return RIPPLE_STRENGTH * (1 - this.age / RIPPLE_LIFETIME);
  }

  distort(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= RIPPLE_RADIUS) return { x: 0, y: 0 };

    const wavePhase = (distance / RIPPLE_RADIUS) * Math.PI;
    const waveOffset = Math.sin(wavePhase - this.age * 0.1);
    const strength = this.getStrength() * waveOffset;

    return {
      x: (dx / distance) * strength,
      y: (dy / distance) * strength,
    };
  }
}

function applyRippleEffect(ctx, video, canvas) {
  if (!video) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  if (ripples.length === 0) return;

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const distortedImageData = ctx.createImageData(canvas.width, canvas.height);
    distortedImageData.data.set(imageData.data);

    ripples.forEach((ripple) => {
      const centerX = Math.floor(ripple.x);
      const centerY = Math.floor(ripple.y);

      for (let y = centerY - RIPPLE_RADIUS; y <= centerY + RIPPLE_RADIUS; y++) {
        if (y < 0 || y >= canvas.height) continue;
        for (
          let x = centerX - RIPPLE_RADIUS;
          x <= centerX + RIPPLE_RADIUS;
          x++
        ) {
          if (x < 0 || x >= canvas.width) continue;

          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > RIPPLE_RADIUS) continue;

          const offset = ripple.distort(x, y);
          const sourceX = Math.min(
            Math.max(Math.round(x + offset.x), 0),
            canvas.width - 1
          );
          const sourceY = Math.min(
            Math.max(Math.round(y + offset.y), 0),
            canvas.height - 1
          );
          const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
          const targetIndex = (y * canvas.width + x) * 4;

          for (let i = 0; i < 4; i++) {
            distortedImageData.data[targetIndex + i] =
              imageData.data[sourceIndex + i];
          }
        }
      }
    });

    ctx.putImageData(distortedImageData, 0, 0);
  } catch (error) {
    console.error("Error in applyRippleEffect:", error);
  }
}

// Add at the top with other constants
const TOTAL_TRACES = 3;
const finalImage = new Image();
finalImage.src = "img/fin.jpg";

// Add these constants at the top with other constants
const MAX_ZOOM = 20; // Maximum zoom level (starting zoom)
const MIN_ZOOM = 1; // Minimum zoom level (fully zoomed out)
const ZOOM_SCROLL_SENSITIVITY = 0.001; // How much zoom changes per scroll pixel

// Modify the transitionToFinalState function
function transitionToFinalState() {
  isInFinalScene = true;
  // Hide all videos and existing canvases
  [backgroundVideo, transitionVideo, loopingVideo, endVideo].forEach(
    (video) => {
      if (video) {
        video.pause();
        video.style.opacity = "0";
      }
    }
  );

  // Remove existing scroll listener
  window.removeEventListener("scroll", handleScroll);

  const sections = document.querySelectorAll(".sections-container .section");
  sections.forEach((section) => {
    if (section.parentNode) {
      section.parentNode.removeChild(section);
    }
  });

  // Add a class to the body to change cursor style
  document.body.classList.add("no-pointer");

  // Create and show final image container
  const finalContainer = document.createElement("div");
  finalContainer.style.position = "fixed";
  finalContainer.style.top = "0";
  finalContainer.style.left = "0";
  finalContainer.style.width = "100%";
  finalContainer.style.height = "100%";
  finalContainer.style.zIndex = "1000";
  finalContainer.style.backgroundColor = "black";
  finalContainer.style.overflow = "hidden";

  const finalImageElement = document.createElement("img");
  finalImageElement.src = "img/fin.jpg";
  finalImageElement.style.width = "100%";
  finalImageElement.style.height = "100%";
  finalImageElement.style.objectFit = "cover";
  finalImageElement.style.transform = `scale(${MAX_ZOOM})`;
  finalImageElement.style.transition = "transform 0.1s ease-out";
  finalImageElement.style.opacity = "0";

  finalContainer.appendChild(finalImageElement);
  document.body.appendChild(finalContainer);

  // Enable scrolling but ensure scrollbars are hidden
  document.documentElement.style.overflow = "auto";
  document.documentElement.style.scrollBehavior = "smooth";
  document.body.style.overflow = "auto";
  document.body.style.overflowX = "hidden";

  window.scrollTo(0, 0);

  // Fade in the image
  requestAnimationFrame(() => {
    finalImageElement.style.opacity = "1";
  });

  // Create and show the lotus image
  const lotusImage = document.createElement("img");
  lotusImage.src = "img/lotus.png";
  lotusImage.style.width = "100px";
  lotusImage.style.opacity = "0";
  lotusImage.style.position = "absolute";
  lotusImage.style.bottom = "50px";
  lotusImage.style.left = "50%";
  lotusImage.style.transform = "translateX(-50%)";
  lotusImage.style.zIndex = "1001";
  lotusImage.style.cursor = "pointer";

  finalContainer.appendChild(lotusImage);

  // Track the current zoom level
  let currentZoom = MAX_ZOOM;

  if (startAudio.paused) {
    startAudio.play().catch((error) => {
      console.error("Error playing start audio:", error);
    });
  }

  // Stop other audio tracks
  transitionAudio.pause();
  loopingSectionAudio.pause();
  sirenAudio.pause();

  // Add new scroll handler for zoom effect
  function handleFinalScroll() {
    const scrollProgress =
      window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight);
    const targetZoom = MAX_ZOOM - scrollProgress * (MAX_ZOOM - MIN_ZOOM);
    currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    finalImageElement.style.transform = `scale(${currentZoom})`;

    if (currentZoom === MIN_ZOOM) {
      lotusImage.style.opacity = "1";
      animateLotus(lotusImage);
    }
  }

  // Set up the scroll area
  const scrollArea = document.createElement("div");
  scrollArea.style.height = "400vh"; // Create extra scroll space
  scrollArea.style.position = "relative";
  scrollArea.style.zIndex = "999";
  document.body.appendChild(scrollArea);

  // Add scroll listener
  window.addEventListener("scroll", handleFinalScroll);

  lotusImage.onclick = function () {
    startAudio.pause();
    location.reload(); // Refresh the page
  };
}

// Function to animate the lotus image
function animateLotus(lotusImage) {
  totalDistance = 0;

  function updateLotusPosition() {
    const movement = {
      x: totalDistance + Math.sin(time * 0.015) * 6,
      y: Math.sin(time * 0.01) * 4 + Math.sin(time * 0.02) * 2,
    };
    totalDistance += RIVER_FLOW_SPEED * flowDirection;

    // Change direction if it reaches the edge
    if (randomLotusPosition.originalX + movement.x > window.innerWidth - 100)
      flowDirection = -1;
    else if (randomLotusPosition.originalX + movement.x < 100)
      flowDirection = 1;

    lotusImage.style.left = `${randomLotusPosition.originalX + movement.x}px`;
    lotusImage.style.top = `${randomLotusPosition.originalY + movement.y}px`;

    requestAnimationFrame(updateLotusPosition);
  }

  updateLotusPosition();
}

// Modify the click handlers to check for completion
function checkAndHandleCompletion() {
  if (nextTraceIndex >= TOTAL_TRACES) {
    // Flash the lotus images
    const lotusTraces = document.querySelectorAll(".lotus-trace");
    lotusTraces.forEach((lotusTrace) => {
      lotusTrace.classList.add("flash");
    });

    // Remove the flash effect after 4 seconds and then transition to final state
    setTimeout(() => {
      lotusTraces.forEach((lotusTrace) => {
        lotusTrace.classList.remove("flash");
      });
      transitionToFinalState();
    }, 4000);
  }
}

function handleClick(e) {
  // Get mouse position relative to each canvas
  const canvas1 = canvases[0];
  const canvas2 = canvases[2];
  const rect1 = canvas1.getBoundingClientRect();
  const rect2 = canvas2.getBoundingClientRect();

  // Check lotus in first section
  if (currentSection1Progress < 1.2 && !firstSectionLotusClicked) {
    const mouseX = e.clientX - rect1.left;
    const mouseY = e.clientY - rect1.top;

    const movement = {
      x: totalDistance + Math.sin(time * 0.015) * 6,
      y: Math.sin(time * 0.01) * 4 + Math.sin(time * 0.02) * 2,
    };

    const lotusX = randomLotusPosition.originalX + movement.x;
    const lotusY = randomLotusPosition.originalY + movement.y;
    const scaledWidth = lotusImage.width * randomLotusPosition.scale;
    const scaledHeight = lotusImage.height * randomLotusPosition.scale;

    if (
      Math.abs(mouseX - lotusX) < scaledWidth / 2 &&
      Math.abs(mouseY - lotusY) < scaledHeight / 2
    ) {
      // Handle lotus click in first section
      const lotusTrace = document.querySelector(
        `.lotus-trace:nth-child(${nextTraceIndex + 1})`
      );
      if (lotusTrace) {
        lotusTrace.src = "img/lotus.png";
        lotusTrace.style.opacity = "1";
        nextTraceIndex++;
        firstSectionLotusClicked = true; // Mark the lotus as clicked
        successAudio.play(); // Play success audio
        checkAndHandleCompletion(); // Add this line
      }
    }
  }

  // Check lotuses in third section
  const mouseX = e.clientX - rect2.left;
  const mouseY = e.clientY - rect2.top;

  floatingObjects.forEach((obj) => {
    if (obj.image === lotusImage && !obj.isClicked) {
      const scaledWidth = obj.image.width * obj.scale;
      const scaledHeight = obj.image.height * obj.scale;
      const dx = mouseX - obj.x;
      const dy = mouseY - obj.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < Math.max(scaledWidth, scaledHeight) / 2) {
        const lotusTrace = document.querySelector(
          `.lotus-trace:nth-child(${nextTraceIndex + 1})`
        );
        if (lotusTrace) {
          lotusTrace.src = "img/lotus.png";
          lotusTrace.style.opacity = "1";
          nextTraceIndex++;
          successAudio.play(); // Play success audio
        }
        obj.isClicked = true;
        obj.opacity = 0; // Immediately hide the lotus
        floatingObjects.splice(floatingObjects.indexOf(obj), 1); // Remove it from the array
        checkAndHandleCompletion(); // Add this line
      }
    }
  });

  // Handle end section lotus click with improved detection
  if (hasReachedEnd && !endSectionLotus.isClicked) {
    const canvas3 = canvases[3];
    const rect3 = canvas3.getBoundingClientRect();
    const mouseX = e.clientX - rect3.left;
    const mouseY = e.clientY - rect3.top;

    // Calculate actual lotus position including rotation
    const dx = mouseX - endSectionLotus.x;
    const dy = mouseY - endSectionLotus.y;

    // Account for rotation in hit detection
    const rotatedDx =
      dx * Math.cos(-endSectionLotus.angle) -
      dy * Math.sin(-endSectionLotus.angle);
    const rotatedDy =
      dx * Math.sin(-endSectionLotus.angle) +
      dy * Math.cos(-endSectionLotus.angle);

    const scaledWidth = lotusImage.width * endSectionLotus.scale;
    const scaledHeight = lotusImage.height * endSectionLotus.scale;

    if (
      Math.abs(rotatedDx) < scaledWidth &&
      Math.abs(rotatedDy) < scaledHeight
    ) {
      const lotusTrace = document.querySelector(
        `.lotus-trace:nth-child(${nextTraceIndex + 1})`
      );
      if (lotusTrace) {
        lotusTrace.src = "img/lotus.png";
        lotusTrace.style.opacity = "1";
        nextTraceIndex++;
        successAudio.play(); // Play success audio
      }
      endSectionLotus.isClicked = true;
      endSectionLotus.opacity = 0;
      checkAndHandleCompletion();
    }
  }
}

// Scene rendering
const scenes = canvases.map((canvas, index) => ({
  canvas,
  ctx: contexts[index],
  drawScene: () => {
    const ctx = contexts[index];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (index === 0 && backgroundVideo) {
      applyRippleEffect(ctx, backgroundVideo, canvas);

      // Only draw the lotus if it hasn't been clicked
      if (!firstSectionLotusClicked) {
        const movement = {
          x: totalDistance + Math.sin(time * 0.015) * 6,
          y: Math.sin(time * 0.01) * 4 + Math.sin(time * 0.02) * 2,
        };
        totalDistance += RIVER_FLOW_SPEED * flowDirection;

        if (
          randomLotusPosition.originalX + movement.x >
          window.innerWidth - 100
        )
          flowDirection = -1;
        else if (randomLotusPosition.originalX + movement.x < 100)
          flowDirection = 1;

        ctx.save();
        ctx.translate(
          randomLotusPosition.originalX + movement.x,
          randomLotusPosition.originalY + movement.y
        );
        ctx.scale(randomLotusPosition.scale, randomLotusPosition.scale);
        ctx.drawImage(
          lotusImage,
          -lotusImage.width / 2,
          -lotusImage.height / 2
        );
        ctx.restore();
      }
    } else if (index === 1 && transitionVideo && hasReachedTransition) {
      ctx.drawImage(transitionVideo, 0, 0, canvas.width, canvas.height);
    } else if (
      index === 2 &&
      loopingVideo &&
      hasReachedBottom &&
      !hasReachedEnd &&
      lotusImage.complete
    ) {
      ctx.drawImage(loopingVideo, 0, 0, canvas.width, canvas.height);

      // Update and draw all remaining floating objects
      floatingObjects.forEach((obj) => {
        obj.update();
        obj.draw(ctx);
      });
    } else if (index === 3 && endVideo && hasReachedEnd) {
      // Draw the end video directly without ripple effect
      ctx.drawImage(endVideo, 0, 0, canvas.width, canvas.height);

      // Update and draw all swimming texts
      swimmingTexts.forEach((text) => {
        text.update();
        text.draw(ctx);
      });

      // Draw the end section lotus only if not clicked
      if (lotusImage.complete && !endSectionLotus.isClicked) {
        endSectionLotus.update();

        ctx.save();
        ctx.translate(endSectionLotus.x, endSectionLotus.y);
        ctx.rotate(endSectionLotus.angle);
        ctx.scale(endSectionLotus.scale, endSectionLotus.scale);

        // First draw: Dark base
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.95;
        ctx.drawImage(
          lotusImage,
          -lotusImage.width / 2,
          -lotusImage.height / 2
        );

        // Second draw: Even darker overlay
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
          lotusImage,
          -lotusImage.width / 2,
          -lotusImage.height / 2
        );

        // Third draw: Final layer with fade effect
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = endSectionLotus.opacity * 0.3;
        ctx.drawImage(
          lotusImage,
          -lotusImage.width / 2,
          -lotusImage.height / 2
        );

        ctx.restore();
      }
    }
  },
}));

// Animation loop
function animate() {
  time++;
  ripples.forEach((ripple, index) => {
    if (!ripple.update()) ripples.splice(index, 1);
  });
  scenes.forEach((scene) => scene.drawScene());
  requestAnimationFrame(animate);
}

// Event listeners
window.addEventListener("scroll", () => {
  requestAnimationFrame(handleScroll);
});

window.addEventListener("resize", () => {
  canvases.forEach((canvas) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  handleScroll();
});

document.removeEventListener("mousemove", handleMouseMove);
document.removeEventListener("click", handleClick);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("click", handleClick);

// Start the animation and initial scroll handling
animate();
handleScroll();

// Mouse event handling
function handleMouseMove(e) {
  // Handle ripple effect in first section only
  const canvas1 = canvases[0];
  const rect1 = canvas1.getBoundingClientRect();

  // Create ripples for first section only
  if (
    e.clientX >= rect1.left &&
    e.clientX <= rect1.right &&
    e.clientY >= rect1.top &&
    e.clientY <= rect1.bottom
  ) {
    ripples.push(new Ripple(e.clientX - rect1.left, e.clientY - rect1.top));
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  }

  let shouldShowPointer = false;

  // Handle cursor changes for first section lotus
  if (currentSection1Progress < 1.2) {
    const mouseX = e.clientX - rect1.left;
    const mouseY = e.clientY - rect1.top;

    const movement = {
      x: totalDistance + Math.sin(time * 0.015) * 6,
      y: Math.sin(time * 0.01) * 4 + Math.sin(time * 0.02) * 2,
    };

    const lotusX = randomLotusPosition.originalX + movement.x;
    const lotusY = randomLotusPosition.originalY + movement.y;
    const scaledWidth = lotusImage.width * randomLotusPosition.scale;
    const scaledHeight = lotusImage.height * randomLotusPosition.scale;

    if (
      Math.abs(mouseX - lotusX) < scaledWidth / 2 &&
      Math.abs(mouseY - lotusY) < scaledHeight / 2
    ) {
      shouldShowPointer = true;
    }
  }

  // Handle cursor changes for looping section
  if (hasReachedBottom && !hasReachedEnd) {
    // Only check looping section if we haven't reached the end
    const canvas2 = canvases[2];
    const rect2 = canvas2.getBoundingClientRect();
    const mouseX = e.clientX - rect2.left;
    const mouseY = e.clientY - rect2.top;

    floatingObjects.forEach((obj) => {
      const scaledWidth = obj.image.width * obj.scale;
      const scaledHeight = obj.image.height * obj.scale;
      const dx = mouseX - obj.x;
      const dy = mouseY - obj.y;

      // Simpler hover detection
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < Math.max(scaledWidth, scaledHeight) / 2) {
        shouldShowPointer = true;
        obj.isHovered = true;
      } else {
        obj.isHovered = false;
      }
    });
  }

  // Handle cursor changes for end section with improved detection
  if (hasReachedEnd && !endSectionLotus.isClicked) {
    const canvas3 = canvases[3];
    const rect3 = canvas3.getBoundingClientRect();
    const mouseX = e.clientX - rect3.left;
    const mouseY = e.clientY - rect3.top;

    const dx = mouseX - endSectionLotus.x;
    const dy = mouseY - endSectionLotus.y;

    // Account for rotation in hover detection
    const rotatedDx =
      dx * Math.cos(-endSectionLotus.angle) -
      dy * Math.sin(-endSectionLotus.angle);
    const rotatedDy =
      dx * Math.sin(-endSectionLotus.angle) +
      dy * Math.cos(-endSectionLotus.angle);

    const scaledWidth = lotusImage.width * endSectionLotus.scale;
    const scaledHeight = lotusImage.height * endSectionLotus.scale;

    if (
      Math.abs(rotatedDx) < scaledWidth &&
      Math.abs(rotatedDy) < scaledHeight
    ) {
      shouldShowPointer = true;
    }
  }

  // Apply cursor style to document body
  document.body.style.cursor = shouldShowPointer ? "pointer" : "default";
}

// Modify the handleScroll function to reinitialize swimming texts when reaching end section
function handleScroll() {
  if (isInFinalScene) return;

  const currentScroll = window.scrollY;
  const section1Height = window.innerHeight * 0.5;
  const section2Height = window.innerHeight;

  currentSection1Progress = currentScroll / section1Height;
  const section2Progress = (currentScroll - section1Height) / section2Height;
  const section3Progress =
    (currentScroll - (section1Height + section2Height)) / section2Height;

  // Play start audio when at the top (scroll position 0,0)
  if (currentScroll >= 0) {
    if (startAudio.paused) {
      startAudio.play().catch((error) => {
        console.error("Error playing start audio:", error);
      });
    }
  } else {
    startAudio.pause();
  }

  // Handle transition audio
  if (section2Progress >= 0 && section2Progress <= 1.2) {
    if (transitionAudio.paused) {
      transitionAudio.play().catch((error) => {
        console.error("Error playing transition audio:", error);
      });
    }
    startAudio.pause();
    loopingSectionAudio.pause();
    sirenAudio.pause();
  } else {
    transitionAudio.pause();
  }

  // Handle looping section audio
  if (section3Progress >= 0 && section3Progress < 1.2) {
    if (loopingSectionAudio.paused) {
      loopingSectionAudio.play().catch((error) => {
        console.error("Error playing looping section audio:", error);
      });
    }
    startAudio.pause();
    sirenAudio.pause();
  } else {
    loopingSectionAudio.pause();
  }

  // Handle end section audio
  if (section3Progress >= 1.2) {
    if (sirenAudio.paused) {
      sirenAudio.play().catch((error) => {
        console.error("Error playing siren audio:", error);
      });
    }
    startAudio.pause();
    transitionAudio.pause();
    loopingSectionAudio.pause();
  } else {
    sirenAudio.pause();
  }

  // Calculate fade values
  const section1Fade = Math.max(0, Math.min(1, 1 - currentSection1Progress));
  const section2Fade = Math.max(
    0,
    Math.min(
      1,
      section2Progress < 0
        ? 1 + section2Progress
        : section2Progress > 1
        ? 2 - section2Progress
        : 1
    )
  );

  // Handle sections
  if (currentSection1Progress < 1.2) {
    if (backgroundVideo && backgroundVideo.paused) {
      backgroundVideo
        .play()
        .catch((e) => console.log("Background video play failed:", e));
    }
    canvases[0].style.opacity = section1Fade;
  } else {
    if (backgroundVideo && !backgroundVideo.paused) {
      backgroundVideo.pause();
    }
    canvases[0].style.opacity = 0;
  }

  if (section2Progress >= -0.2 && section2Progress <= 1.2) {
    hasReachedTransition = true;
    if (transitionVideo) {
      transitionVideo.currentTime =
        Math.max(0, Math.min(1, section2Progress)) * transitionVideo.duration;
      transitionVideo.style.opacity = section2Fade;
    }
    canvases[1].style.opacity = section2Fade;
  } else if (section2Progress < 0) {
    hasReachedTransition = false;
    if (transitionVideo) {
      transitionVideo.currentTime = 0;
      transitionVideo.style.opacity = "0";
    }
    canvases[1].style.opacity = 0;
  }

  if (section3Progress >= -0.2) {
    if (!hasReachedBottom && loopingVideo) {
      hasReachedBottom = true;
      loopingVideo
        .play()
        .catch((e) => console.log("Looping video play failed:", e));
      loopingVideo.style.opacity = "1";

      // Reinitialize floating objects when entering looping section
      floatingObjects.length = 0; // Clear existing objects
      floatingObjects.push(new FloatingObject(lotusImage)); // Add original lotus
      additionalImages.forEach((img) =>
        floatingObjects.push(new FloatingObject(img))
      ); // Add additional images
    }
    canvases[2].style.opacity = 1;
  } else {
    hasReachedBottom = false;
    if (loopingVideo) {
      loopingVideo.pause();
      loopingVideo.style.opacity = "0";
    }
    // Clear floating objects when leaving looping section
    floatingObjects.length = 0;
    canvases[2].style.opacity = 0;
  }

  if (section3Progress >= 1.2) {
    if (!hasReachedEnd && endVideo) {
      hasReachedEnd = true;
      endVideo.play().catch((e) => console.log("End video play failed:", e));
      endVideo.style.opacity = "1";
      // Initialize swimming texts when reaching end section
      initializeSwimmingTexts();
    }
    canvases[3].style.opacity = 1;
    canvases[2].style.opacity = 0; // Ensure looping section canvas is hidden
    canvases[2].style.pointerEvents = "none"; // Disable pointer events
  } else {
    hasReachedEnd = false;
    if (endVideo) {
      endVideo.pause();
      endVideo.style.opacity = "0";
    }
    canvases[3].style.opacity = 0;
    if (hasReachedBottom) {
      canvases[2].style.opacity = 1;
      canvases[2].style.pointerEvents = "all"; // Re-enable pointer events
    }
  }

  lastScrollPosition = currentScroll;
}

// Scroll to the top on page load
window.addEventListener("load", () => {
  lastScrollPosition = 0;
  window.scrollTo(0, 0);
});

function fadeAudio(currentAudio, nextAudio, duration) {
  const fadeOutInterval = 50; // Interval in milliseconds
  const steps = duration / fadeOutInterval;
  const fadeOutStep = currentAudio.volume / steps;
  const fadeInStep = nextAudio.volume / steps;

  let currentStep = 0;

  const fadeOut = setInterval(() => {
    if (currentStep < steps) {
      currentAudio.volume -= fadeOutStep;
      nextAudio.volume += fadeInStep;
      currentStep++;
    } else {
      clearInterval(fadeOut);
      currentAudio.pause();
      currentAudio.volume = 0; // Reset volume to 0 after fading out
    }
  }, fadeOutInterval);
}
history.scrollRestoration = "manual"; // Prevent automatic scroll restoration
