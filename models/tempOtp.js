module.exports = (sequelize, DataTypes) => {
  const TempOtp = sequelize.define(
    "tempOtp",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING, // You can choose an appropriate data type based on your needs
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

  return TempOtp;
};
