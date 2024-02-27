const { Sequelize } = require("sequelize");
const db = require("../models/index");
const { encryptData, decryptData } = require('../encryption/aesEncryption');

const generateOTPImage = require("../cryptography/imageGenerator");
const generateShares = require("../cryptography/cryptography");
const {
  sendOtpEmail,
  newAccountCreatedMail,
} = require("../middleware/sendEmail"); // Import your email service module
const OTP = db.tempOtp;
const Examinerdb = db.examiners;
const fs = require("fs");
const nodemailer = require("nodemailer");
const Jimp = require("jimp");
const { createCanvas, loadImage } = require("canvas");


exports.otpGenerator = async (req, res) => {
  try {
    const { email } = req.body; // Assuming you're getting the email from the request body.

    // Generate a new OTP
    async function generateOTP(length) {
      const chars = "0123456789";
      let otp = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
      }
      return otp;
    }

   
    
    const otp = await generateOTP(6);
    await generateOTPImage(otp);
    // Generate OTP image
    const shares = await generateShares();

    const share1Base64 = shares.share1.toString("base64");

    console.log("share1Base64 length:", share1Base64.length);

    // Check if a user with the provided email exists
    const existingUser = await Examinerdb.findOne({ where: { email: email } });
    if (existingUser) {
      // Check if there's an existing OTP record for the same user
      let otpRecord = await OTP.findOne({ where: { userId: existingUser.id } });

      if (otpRecord) {
        // If an OTP record exists, update it with the new OTP and reset the expiration time.
        otpRecord.otp = otp;
        otpRecord.createdAt = new Date(); // Reset the creation time (if you want to consider it for expiration).
        await otpRecord.save();
      } else {
        // If no OTP record exists, create a new one.
        otpRecord = await OTP.create({
          userId: existingUser.id,
          otp: otp,
        });
      }
      console.log("Email sent to", email);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "pravin.suthar6484@gmail.com", // Your Gmail email address
          pass: "wcvq fkho egpr uvxw", // Your Gmail password or application-specific password
        },
      });

      const mailOptions = {
        from: "pravin.suthar6484@gmail.com", 
        to: email, 
        subject: "OTP Verification", 
        text: `Your OTP is: ${otp}`,
        attachments: [
          {
            filename: "share1.png", 
            content: shares.share1, 
            contentType: "image/png" 
          },
          {
            filename: "share2.png", 
            content: shares.share2, 
            contentType: "image/png" 
          },
        ],
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log("Mail sent successfully");
      } catch (err) {
        console.error("Error sending mail:", err);
      } finally {
        transporter.close();
      }

      // Send the OTP via email
      //  await sendOtpEmail(email, otp, share2Image);
      console.log("Otp sent to the email is ", otp);
      res.status(200).json({
        success: true,
        message: "OTP sent to your email",
        otpRecord,
        share1 : share1Base64
        
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Kindly Register First",
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.registerExaminer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      address,
      qualifications,
    } = req.body; 

    // Check if any parameter is undefined
    if (
      firstName === undefined ||
      lastName === undefined ||
      email === undefined ||
      phoneNumber === undefined ||
      gender === undefined ||
      address === undefined ||
      qualifications === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more parameters are missing in the request body",
      });
    }

    // Encrypt examiner data before storing it in the database
    await Examinerdb.create({
      firstName: encryptData(firstName),
      lastName: encryptData(lastName),
      email: encryptData(email),
      phoneNumber: encryptData(phoneNumber),
      gender: encryptData(gender),
      address: encryptData(address),
      qualifications: encryptData(qualifications),
    });
    
    return res
      .status(201)
      .json({ success: true, message: "Examiner registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};



exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if a user with the provided email exists
    const existingUser = await Examinerdb.findOne({ where: { email: email } });

    if (existingUser) {
      // Check if there's an OTP record for the user
      const otpRecord = await OTP.findOne({
        where: { userId: existingUser.id },
      });

      if (otpRecord) {
        // Check if the provided OTP matches the one stored in the database
        if (otp === otpRecord.otp) {
          // You can mark the OTP record as used or delete it, depending on your requirements.
          // For example, to mark it as used:
          // otpRecord.used = true;
          // await otpRecord.save();

          res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            examinersid: existingUser.id,
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "No OTP record found for this user",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "User not found. Kindly Register First",
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
