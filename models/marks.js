module.exports = (sequelize, DataTypes) => {
  const StudentMarks = sequelize.define(
    "studentMarks",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      examinerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rollNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marks: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      course: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      examType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      updatedAt: "updatedAt",
      createdAt: "createdAt",
    }
  );

  // Define associations or other custom methods here

  return StudentMarks;
};
