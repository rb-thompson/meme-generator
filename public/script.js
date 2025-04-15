let currentImage = null;
let currentInput = null;

// Show the main content after a short delay
document.addEventListener("DOMContentLoaded", () => {
  const initialLoader = document.getElementById("initialLoader");
  const mainContent = document.getElementById("mainContent");

  // Fade out the initial loader after 2 seconds
  setTimeout(() => {
    initialLoader.classList.add("fade-out");
    mainContent.style.display = "block";
  }, 2000);
});

// Handle image upload button icon change
document.getElementById("imageInput").addEventListener("change", () => {
  const imageInput = document.getElementById("imageInput");
  const uploadIcon = document.getElementById("uploadIcon");
  const uploadButton = document.getElementById("uploadButton");

  if (imageInput.files && imageInput.files.length > 0) {
    uploadIcon.className = "fas fa-thumbs-up pop"; // Change to checkmark icon with pop animation
    uploadButton.classList.add("text-hidden"); // Hide the text
  } else {
    uploadIcon.className = "fas fa-image"; // Revert to image icon
    uploadButton.classList.remove("text-hidden"); // Show the text
  }
});

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

async function drawMeme(img, caption) {
  const canvas = document.getElementById("memeCanvas");
  const buttonGroup = document.getElementById("buttonGroup");
  const output = document.getElementById("memeOutput");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const uploadIcon = document.getElementById("uploadIcon");
  const uploadButton = document.getElementById("uploadButton");
  const imageInput = document.getElementById("imageInput");
  const ctx = canvas.getContext("2d");

  const maxWidth = 600; // Updated to match styles.css max-width
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  ctx.font = "30px Impact";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.textAlign = "center";

  const textMaxWidth = width * 0.9;
  const lines = wrapText(ctx, caption, textMaxWidth);
  const lineHeight = 35;
  const textHeight = lines.length * lineHeight + 20;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, height - textHeight, width, textHeight);

  ctx.fillStyle = "white";
  lines.forEach((line, index) => {
    const y = height - textHeight + (index + 1) * lineHeight;
    ctx.fillText(line, width / 2, y);
    ctx.strokeText(line, width / 2, y);
  });

  canvas.style.display = "block";
  output.style.display = "none";
  buttonGroup.style.display = "flex";
  loadingSpinner.style.display = "none";
  uploadIcon.className = "fas fa-upload"; // Reset to upload icon
  uploadButton.classList.remove("text-hidden"); // Show the text
  imageInput.value = ""; // Clear the file input
}

async function generateMeme() {
  let input = document.getElementById("memeInput").value;
  let imageInput = document.getElementById("imageInput").files[0];
  let output = document.getElementById("memeOutput");
  let canvas = document.getElementById("memeCanvas");
  let buttonGroup = document.getElementById("buttonGroup");
  let loadingSpinner = document.getElementById("loadingSpinner");

  output.innerText = "Generating...";
  output.style.display = "block";
  canvas.style.display = "none";
  buttonGroup.style.display = "none";
  loadingSpinner.style.display = "flex"; // Show spinner during API call

  try {
    const response = await fetch("/generate-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: input }),
    });
    const data = await response.json();

    if (data.caption) {
      if (imageInput) {
        let img = new Image();
        img.onload = function () {
          currentImage = img;
          currentInput = input;
          drawMeme(img, data.caption);
        };
        img.src = URL.createObjectURL(imageInput);
      } else {
        output.innerText = data.caption;
        output.style.display = "block";
        buttonGroup.style.display = "none";
        loadingSpinner.style.display = "none"; // Hide spinner
      }
    } else {
      output.innerText = data.error || "Oops, something went wrong!";
      output.style.display = "block";
      buttonGroup.style.display = "none";
      loadingSpinner.style.display = "none"; // Hide spinner
    }
  } catch (error) {
    output.innerText = "Error generating meme. Try again!";
    output.style.display = "block";
    buttonGroup.style.display = "none";
    loadingSpinner.style.display = "none"; // Hide spinner
    console.error(error);
  }
}

async function regenerateCaption() {
  if (!currentImage || !currentInput) {
    alert("Please generate a meme with an image first!");
    return;
  }

  let output = document.getElementById("memeOutput");
  let loadingSpinner = document.getElementById("loadingSpinner");
  output.innerText = "Regenerating caption...";
  output.style.display = "block";
  loadingSpinner.style.display = "flex"; // Show spinner during API call

  try {
    const response = await fetch("/generate-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: currentInput }),
    });
    const data = await response.json();

    if (data.caption) {
      await drawMeme(currentImage, data.caption);
    } else {
      output.innerText = data.error || "Oops, something went wrong!";
      output.style.display = "block";
      loadingSpinner.style.display = "none"; // Hide spinner
    }
  } catch (error) {
    output.innerText = "Error regenerating caption. Try again!";
    output.style.display = "block";
    loadingSpinner.style.display = "none"; // Hide spinner
    console.error(error);
  }
}

function downloadMeme() {
  let canvas = document.getElementById("memeCanvas");
  let link = document.createElement("a");
  link.download = "meme.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}