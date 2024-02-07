const { Sequelize } = require("sequelize");
const db = require("../models/index");

const visualCryptography = require("../cryptography/cryptography").default;
const {
  sendOtpEmail,
  newAccountCreatedMail,
} = require("../middleware/sendEmail");
//const { Examiner } = require("../models/examiner"); // Import the Examiner model
const StudentMarks = db.studentMarks;
const Examinerdb = db.examiners;

//const { StudentMarks } = require('../models/marks'); // Import your StudentMarks model here

exports.createStudentMark = async (req, res) => {
  try {
    var { studentId, rollNo, marks, course, examType } = req.body;
    var id = req.params.id;

    // Check if a student mark entry with the same roll number already exists
    const existingStudentMark = await StudentMarks.findOne({
      where: {
        rollNo: rollNo, // Define the condition explicitly in options.where
      },
    });
    if (existingStudentMark) {
      return res.status(400).json({
        success: false,
        message: "Student mark entry with the same roll number already exists.",
      });
    }


    // Create a new student mark entry
    marks = JSON.stringify(marks);
    const studentMark = await StudentMarks.create({
      studentId: "5",
      rollNo,
      marks,
      course,
      examType,
      examinerId: id,
    });

    return res.status(200).json({
      success: true,
      studentMark,
      message: "Marks entered Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllStudentsMarks = async (req, res) => {
  try {
    var id = req.params.id;
    // Fetch all student mark entries
    const studentMark = await StudentMarks.findAll({
      where: { examinerId: id },
    });
    return res.status(200).json({
      success: true,
      studentMark,
      message: "All Student data fetched successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStudentMark = async (req, res) => {
  try {
    var { studentId, rollNo, marks, course, examType } = req.body;
    var id = req.params.id;
    // Find the student mark entry by ID
    const studentMark = await StudentMarks.findOne({
      where: {
        rollNo: id, // 'id' should be the value you want to search for in the 'rollNo' column
      },
    });
    if (!studentMark) {
      return res
        .status(404)
        .json({ success: false, message: "Student mark not found" });
    }
    marks = JSON.stringify(marks);
    // Update the student mark entry
    studentMark.rollNo = rollNo;
    studentMark.marks = marks;
    studentMark.course = course;
    studentMark.examType = examType;
    studentMark.studentId = 10;
    await studentMark.save();
    return res.status(200).json({
      success: true,
      studentMark,
      message: "Marks Updated Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStudentMark = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the student mark entry by ID and delete it
    const studentMark = await StudentMarks.findByPk(id);
    if (!studentMark) {
      return res
        .status(404)
        .json({ success: false, message: "Student mark not found" });
    }
    await studentMark.destroy();
    return res.status(200).json({
      success: true,
      studentMark,
      message: "Marks entered Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudentMarkById = async (req, res) => {
  try {
    var id = req.body.studentid;
    var examinerid = req.body.examinerid;

    // Find the student mark entry by ID
    const studentMark = await StudentMarks.findOne({
      where: {
        examinerId: examinerid,
        rollNo: id, // 'id' should be the value you want to search for in the 'rollNo' column
      },
    });

    if (!studentMark) {
      return res
        .status(404)
        .json({ success: false, message: "Student mark not found" });
    }

    return res.status(200).json({
      success: true,
      studentMark,
      message: "Marks fetchdfded Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
