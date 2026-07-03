const Table = require("../models/tableModel");
const createHttpError = require("http-errors");

const VALID_TABLE_STATUSES = ["Available", "Booked"];

const normalizeTableInput = ({ tableNo, seats }) => {
  const normalizedTableNo = Number(tableNo);
  const normalizedSeats = Number(seats);

  if (
    !Number.isInteger(normalizedTableNo) ||
    normalizedTableNo <= 0 ||
    !Number.isInteger(normalizedSeats) ||
    normalizedSeats <= 0
  ) {
    const error = createHttpError(400, "Table number and seats must be positive numbers");
    throw error;
  }

  return { normalizedTableNo, normalizedSeats };
};

const seedTables = async () => {
  try {
    const count = await Table.countDocuments();
    if (count > 0) return;

    const tables = [];

    for (let i = 1; i <= 10; i++) {
      let seats = 4;

      if (i >= 1 && i <= 3) seats = 2;
      else if (i >= 4 && i <= 8) seats = 4;
      else if (i >= 9 && i <= 10) seats = 6;

      tables.push({
        _id: i,
        tableNo: i,
        seats,
        status: "Available",
      });
    }

    await Table.insertMany(tables);
    console.log("Tables created");
  } catch (error) {
    console.log(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate({
      path: "currentOrder",
      select: "customerDetails",
    });

    res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, currentOrder } = req.body;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return next(createHttpError(400, "Invalid id!"));
    }

    if (status && !VALID_TABLE_STATUSES.includes(status)) {
      return next(createHttpError(400, "Invalid table status!"));
    }

    const update = {};
    if (status !== undefined) update.status = status;
    if (currentOrder !== undefined) update.currentOrder = currentOrder;

    const table = await Table.findOneAndUpdate({ _id: id }, update, { new: true });

    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }

    res.status(200).json({
      success: true,
      message: "Table updated!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

const createTable = async (req, res, next) => {
  try {
    const { normalizedTableNo, normalizedSeats } = normalizeTableInput(req.body);

    const existingTable = await Table.findOne({ tableNo: normalizedTableNo });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Table already exists!",
      });
    }

    const table = await Table.create({
      _id: normalizedTableNo,
      tableNo: normalizedTableNo,
      seats: normalizedSeats,
      status: "Available",
    });

    res.status(201).json({
      success: true,
      message: "Table created!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

const addTable = async (req, res, next) => {
  try {
    const { normalizedTableNo, normalizedSeats } = normalizeTableInput(req.body);
    const status = req.body.status || "Available";

    if (!VALID_TABLE_STATUSES.includes(status)) {
      return next(createHttpError(400, "Invalid table status!"));
    }

    const existingTable = await Table.findOne({ tableNo: normalizedTableNo });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Table already exists",
      });
    }

    const table = await Table.create({
      _id: normalizedTableNo,
      tableNo: normalizedTableNo,
      seats: normalizedSeats,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Table created!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return next(createHttpError(400, "Invalid id!"));
    }

    const table = await Table.findOne({ _id: id });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found!",
      });
    }

    if (table.status === "Booked") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete booked table!",
      });
    }

    await Table.deleteOne({ _id: id });

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