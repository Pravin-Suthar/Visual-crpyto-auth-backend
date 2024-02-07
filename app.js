const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");

require("dotenv").config();
const db = require("./models/index.js");
const port = process.env.PORT || 6000;

const examinerRoutes = require("./routes/examiner");
const marksRoutes = require("./routes/marks.js");
app.use(express.json());
app.use("/api/examiner", examinerRoutes);
app.use("/api/marks", marksRoutes);

app.listen(port, () => {
  console.log("Starting the listing process.");
  console.log(
    `${process.env.NODE_ENV} Server is running on port: http://localhost:${port}`
  );
});

const Jimp = require('jimp');


async function generateShares(shareCount) {
  try {
      const originalImage = await Jimp.read("AAA.png");

      // Split the original image into its RGB channels
      const redChannel = originalImage.clone().bitmap.data.slice(0, originalImage.bitmap.data.length / 4);
      const greenChannel = originalImage.clone().bitmap.data.slice(originalImage.bitmap.data.length / 4, originalImage.bitmap.data.length / 2);
      const blueChannel = originalImage.clone().bitmap.data.slice(originalImage.bitmap.data.length / 2, originalImage.bitmap.data.length * 3 / 4);

      // Create random_matrices and combine them based on shareCount
      const randomMatrices = [];
      const shares = [];

      for (let i = 0; i < shareCount; i++) {
          const random_matrix_red = createRandomMatrix(originalImage.bitmap.width, originalImage.bitmap.height);
          const random_matrix_green = createRandomMatrix(originalImage.bitmap.width, originalImage.bitmap.height);
          const random_matrix_blue = createRandomMatrix(originalImage.bitmap.width, originalImage.bitmap.height);

          const random_matrix_xored_red = xorMatrix(random_matrix_red, redChannel, originalImage.bitmap.width, originalImage.bitmap.height);
          const random_matrix_xored_green = xorMatrix(random_matrix_green, greenChannel, originalImage.bitmap.width, originalImage.bitmap.height);
          const random_matrix_xored_blue = xorMatrix(random_matrix_blue, blueChannel, originalImage.bitmap.width, originalImage.bitmap.height);

          randomMatrices.push({
              red: random_matrix_xored_red,
              green: random_matrix_xored_green,
              blue: random_matrix_xored_blue
          });
      }

      // Combine the shares for each color channel
      for (let i = 0; i < shareCount; i++) {
          const combinedImage = combineChannelsToImage(randomMatrices[i].red, randomMatrices[i].green, randomMatrices[i].blue, originalImage.bitmap.width, originalImage.bitmap.height);
          shares.push(combinedImage);
          await shares[i].writeAsync(`share${i + 1}.png`);
      }

      // Convert share images to buffers
      const shareBuffers = await Promise.all(shares.map(async (share) => await share.getBufferAsync(Jimp.MIME_PNG)));

      return shareBuffers;
  } catch (error) {
      console.error("Error generating shares:", error);
      throw error;
  }
}

// Function to create a random binary matrix
function createRandomMatrix(width, height) {
  const matrix = [];
  for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
          const randomValue = Math.random() < 0.5 ? 0 : 255;
          row.push(randomValue);
      }
      matrix.push(row);
  }
  return matrix;
}

// Function to perform XOR operation on two matrices
function xorMatrix(matrix1, matrix2, width, height) {
  const resultMatrix = [];
  for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
          const xorValue = matrix1[y][x] ^ matrix2[y * width + x];
          row.push(xorValue);
      }
      resultMatrix.push(row);
  }
  return resultMatrix;
}

// Function to combine the shares for each color channel into a single image
function combineChannelsToImage(redMatrix, greenMatrix, blueMatrix, width, height) {
  const combinedImage = new Jimp(width, height);
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const redValue = redMatrix[y][x];
          const greenValue = greenMatrix[y][x];
          const blueValue = blueMatrix[y][x];
          const color = Jimp.rgbaToInt(redValue, greenValue, blueValue, 255);
          combinedImage.setPixelColor(color, x, y);
      }
  }
  return combinedImage;
}
async function retrieveOriginalImage(shareBuffers) {
  try {
      // Load share images from buffers
      const shares = await Promise.all(shareBuffers.map(async (shareBuffer) => await Jimp.read(shareBuffer)));

      // Create empty matrices for red, green, and blue channels
      const redMatrix = [];
      const greenMatrix = [];
      const blueMatrix = [];

      // Iterate through each pixel in each share and XOR the pixel values
      for (let y = 0; y < shares[0].bitmap.height; y++) {
          const redRow = [];
          const greenRow = [];
          const blueRow = [];
          for (let x = 0; x < shares[0].bitmap.width; x++) {
              let redValue = 0;
              let greenValue = 0;
              let blueValue = 0;
              for (let i = 0; i < shares.length; i++) {
                  const pixelColor = Jimp.intToRGBA(shares[i].getPixelColor(x, y));
                  redValue ^= pixelColor.r;
                  greenValue ^= pixelColor.g;
                  blueValue ^= pixelColor.b;
              }
              redRow.push(redValue);
              greenRow.push(greenValue);
              blueRow.push(blueValue);
          }
          redMatrix.push(redRow);
          greenMatrix.push(greenRow);
          blueMatrix.push(blueRow);
      }

      // Create a new Jimp image using the reconstructed pixel values
      const originalImage = new Jimp(shares[0].bitmap.width, shares[0].bitmap.height);
      for (let y = 0; y < originalImage.bitmap.height; y++) {
          for (let x = 0; x < originalImage.bitmap.width; x++) {
              const color = Jimp.rgbaToInt(redMatrix[y][x], greenMatrix[y][x], blueMatrix[y][x], 255);
              originalImage.setPixelColor(color, x, y);
          }
      }

      // Save the reconstructed image
      await originalImage.writeAsync("reconstructed_image.png");

      return originalImage;
  } catch (error) {
      console.error("Error retrieving original image:", error);
      throw error;
  }
}

(async () => {
  const shareBuffers = await generateShares(10); // Assuming 10 shares are generated
  await retrieveOriginalImage(shareBuffers);
  console.log("Original image has been reconstructed.");
})();