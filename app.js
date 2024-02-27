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
