const { Sequelize } = require("sequelize");
const db = require("../models/index");
const { encryptData, decryptData } = require("../encryption/aesEncryption");

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

    marks = JSON.stringify(marks);

    rollNo = rollNo;
    marks = encryptData(marks);
    course = encryptData(course);
    examType = encryptData(examType);

    // Create a new student mark entry
    const studentMark = await StudentMarks.create({
      studentId: 1,
      rollNo: rollNo,
      marks: marks,
      course: course,
      examType: examType,
      examinerId: id,
    });

    const decryptedStudentMark = {
      ...studentMark.toJSON(),
      rollNo: studentMark.rollNo,
      marks: JSON.parse(decryptData(studentMark.marks)), 
      course: decryptData(studentMark.course),
      examType: decryptData(studentMark.examType),
    };

    return res.status(200).json({
      success: true,
      studentMark: decryptedStudentMark,
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
    const decryptedStudentMarks = studentMark.map((studentMark) => {
      return {
        ...studentMark.toJSON(),
        rollNo: studentMark.rollNo,
        marks: decryptData(studentMark.marks),
        course: decryptData(studentMark.course),
        examType: decryptData(studentMark.examType),
      };
    });

    console.log();

    return res.status(200).json({
      success: true,
      studentMark: decryptedStudentMarks,
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


    studentMark.studentId = 1;
    studentMark.rollNo = rollNo;
    studentMark.marks = encryptData(JSON.stringify(marks));
    studentMark.course = encryptData(course);
    studentMark.examType = encryptData(examType);

    // Update the student mark entry
    await studentMark.save();

    studentMark.rollNo = studentMark.rollNo;
    studentMark.marks = JSON.parse(decryptData(studentMark.marks));
    studentMark.course = decryptData(studentMark.course);
    studentMark.examType = decryptData(studentMark.examType);

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
    const id = req.body.studentid;
    const examinerId = req.body.examinerid;

    // Find the student mark entry by ID
    let studentMark = await StudentMarks.findOne({
      where: {
        examinerId: examinerId,
        rollNo: id,
      },
    });

    if (!studentMark) {
      return res
        .status(404)
        .json({ success: false, message: "Student mark not found" });
    }

    studentMark.rollNo = studentMark.rollNo;
    studentMark.marks = JSON.parse(decryptData(studentMark.marks));
    studentMark.course = decryptData(studentMark.course);
    studentMark.examType = decryptData(studentMark.examType);

    return res.status(200).json({
      success: true,
      studentMark,
      message: "Marks fetched Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
