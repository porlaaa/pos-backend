const Table = require("../models/tableModel");
const createHttpError = require("http-errors");

const seedTables = async () => {

  try {

    const count =
      await Table.countDocuments();

    if (count > 0) return;

    const tables = [];

    for (let i = 1; i <= 10; i++) {

      let seats = 4;

      // ✅ โต๊ะ 1-3 = 2 ที่นั่ง
      if (i >= 1 && i <= 3) {
        seats = 2;
      }

      // ✅ โต๊ะ 4-8 = 4 ที่นั่ง
      else if (i >= 4 && i <= 8) {
        seats = 4;
      }

      // ✅ โต๊ะ 9-10 = 6 ที่นั่ง
      else if (i >= 9 && i <= 10) {
        seats = 6;
      }

      tables.push({
        _id: i,

        tableNo: i,

        seats,

        status: "Available",
      });
    }

    await Table.insertMany(tables);

    console.log(
      "✅ Tables created"
    );

  } catch (error) {

    console.log(error);
  }
};

const getTables = async (
  req,
  res,
  next
) => {

  try {

    const tables =
      await Table.find().populate({
        path: "currentOrder",

        select:
          "customerDetails",
      });

    res.status(200).json({
      success: true,

      data: tables,
    });

  } catch (error) {

    next(error);
  }
};

const updateTable = async (
  req,
  res,
  next
) => {

  try {

    const {
      status,
      currentOrder,
    } = req.body;

    const { id } = req.params;

    console.log(
      "UPDATE TABLE ID:",
      id
    );

    if (isNaN(id)) {

      const error =
        createHttpError(
          400,
          "Invalid id!"
        );

      return next(error);
    }

    const table =
      await Table.findOneAndUpdate(
        { _id: Number(id) },

        {
          status,
          currentOrder,
        },

        { new: true }
      );

    if (!table) {

      const error =
        createHttpError(
          404,
          "Table not found!"
        );

      return next(error);
    }

    res.status(200).json({
      success: true,

      message:
        "Table updated!",

      data: table,
    });

  } catch (error) {

    console.log(error);

    next(error);
  }
};

const createTable = async (
  req,
  res,
  next
) => {

  try {

    const {
      tableNo,
      seats,
    } = req.body;

    const existingTable =
      await Table.findOne({
        tableNo,
      });

    if (existingTable) {

      return res.status(400).json({
        success: false,
        message:
          "Table already exists!",
      });
    }

    const table =
      await Table.create({
        _id: tableNo,
        tableNo,
        seats,
        status: "available",
      });

    res.status(201).json({
      success: true,
      message:
        "Table created!",
      data: table,
    });

  } catch (error) {

    next(error);
  }
};

const addTable = async (
  req,
  res
) => {

  try {

    const {
      tableNo,
      seats,
      status,
    } = req.body;

    const existingTable =
      await Table.findOne({
        tableNo,
      });

    if (existingTable) {

      return res.status(400).json({
        success: false,
        message:
          "Table already exists",
      });
    }

    const table =
      await Table.create({

        // ✅ สำคัญมาก
        _id: Number(tableNo),

        tableNo:
          Number(tableNo),

        seats:
          Number(seats),

        status:
          status || "Available",
      });

    res.status(201).json({
      success: true,
      data: table,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTable = async (
  req,
  res,
  next
) => {

  try {

    const { id } = req.params;

    const table =
      await Table.findOneAndDelete({
        _id: Number(id),
      });

    if (!table) {

      return res.status(404).json({
        success: false,
        message: "Table not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Table deleted!",
    });

  } catch (error) {

    next(error);
  }
};

module.exports = {
  seedTables,
  getTables,
  updateTable,
  createTable,
  addTable,
  deleteTable,
};