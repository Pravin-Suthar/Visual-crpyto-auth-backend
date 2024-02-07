const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function generateOTPImage(otp) {
  const canvas = createCanvas(350, 350);
  const context = canvas.getContext("2d");

  // Set the background color
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Set the text properties
  context.fillStyle = "#000000";
  context.textBaseline = "middle";

  // Calculate the optimal font size for equal digit width
  const fontSize = 50; // Adjust 20 as needed for padding

  // Draw each digit of the OTP with equal size
  for (let i = 0; i < otp.length; i++) {
    context.font = `bold ${fontSize}px Arial`;
    const digit = otp[i];
    const digitWidth = context.measureText(digit).width;
    const digitX = (canvas.width - otp.length * digitWidth) / 2 + i * digitWidth;
    const digitY = canvas.height / 2;
    context.fillText(digit, digitX, digitY);
  }

  // Add random noise lines
  for (let i = 0; i < 20; i++) {
    context.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${Math.random()})`;
    context.lineWidth = Math.random() * 2;
    context.beginPath();
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.stroke();
  }

  // Add random noise dots
  for (let i = 0; i < 100; i++) {
    context.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${Math.random()})`;
    context.beginPath();
    context.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 2,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  // Save the canvas as a PNG image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("otp_captcha.png", buffer);
}

module.exports = generateOTPImage;
