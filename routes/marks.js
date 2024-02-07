const express = require("express");
const {
  createStudentMark,
  updateStudentMark,
  deleteStudentMark,
  getStudentMarkById,
  getAllStudentsMarks,
} = require("../controllers/marks");

const router = express.Router();

router.route("/createStudentMark/:id").post(createStudentMark);
router.route("/updateStudentMark/:id").patch(updateStudentMark);
router.route("/deleteStudentMark/:id").post(deleteStudentMark);
router.route("/getStudentMarkById").post(getStudentMarkById);
router.route("/getAllStudentsMarks/:id").get(getAllStudentsMarks);
module.exports = router;
