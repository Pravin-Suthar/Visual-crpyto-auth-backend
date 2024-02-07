module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
      studentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },  rollNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        type: DataTypes.CHAR(1),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
    });
  
    return Student;
  };
  