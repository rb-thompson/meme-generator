let currentImage = null; // Store the current image
let currentInput = null; // Store the current user input
let currentCanvasData = null; // Store the canvas data URL for sharing

// Function to wrap text
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

// Function to draw the meme
async function drawMeme(img, caption) {
  const canvas = document.getElementById("memeCanvas");
  const buttonGroup = document.getElementById("buttonGroup");
  const output = document.getElementById("memeOutput");
  const ctx = canvas.getContext("2d");

  const maxWidth = 500;
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
  currentCanvasData = canvas.toDataURL("image/png"); // Store canvas data for sharing
}

async function generateMeme() {
  let input = document.getElementById("memeInput").value;
  let imageInput = document.getElementById("imageInput").files[0];
  let output = document.getElementById("memeOutput");
  let canvas = document.getElementById("memeCanvas");
  let buttonGroup = document.getElementById("buttonGroup");

  // Clear previous output and show "Generating..."
  output.innerText = "Generating...";
  output.style.display = "block";
  canvas.style.display = "none";
  buttonGroup.style.display = "none";

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
          currentImage = img; // Store the image
          currentInput = input; // Store the input
          drawMeme(img, data.caption);
        };
        img.src = URL.createObjectURL(imageInput);
      } else {
        output.innerText = data.caption;
        output.style.display = "block";
        buttonGroup.style.display = "none";
      }
    } else {
      output.innerText = data.error || "Oops, something went wrong!";
      output.style.display = "block";
      buttonGroup.style.display = "none";
    }
  } catch (error) {
    output.innerText = "Error generating meme. Try again!";
    output.style.display = "block";
    buttonGroup.style.display = "none";
    console.error(error);
  }
}

async function regenerateCaption() {
  if (!currentImage || !currentInput) {
    alert("Please generate a meme with an image first!");
    return;
  }

  let output = document.getElementById("memeOutput");
  output.innerText = "Regenerating caption...";
  output.style.display = "block";

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
    }
  } catch (error) {
    output.innerText = "Error regenerating caption. Try again!";
    output.style.display = "block";
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

async function shareOnX() {
  let output = document.getElementById("memeOutput");
  output.innerText = "Sharing on X...";
  output.style.display = "block";

  try {
    const response = await fetch("/share-on-x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: currentCanvasData }),
    });
    const data = await response.json();

    if (data.success) {
      output.innerText = "Successfully shared on X!";
    } else {
      output.innerText = data.error || "Failed to share on X.";
    }
  } catch (error) {
    output.innerText = "Error sharing on X. Try again!";
    console.error(error);
  }
}