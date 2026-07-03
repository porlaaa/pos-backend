const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Item = require("../models/itemModel");

const TAX_RATE = 0.07;
const VALID_ORDER_STATUSES = ["In Progress", "Ready", "Completed"];
const VALID_PAYMENT_METHODS = ["Cash", "Online"];

const calculateBills = (items) => {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const tax = total * TAX_RATE;

  return {
    total,
    tax,
    totalWithTax: total + tax,
  };
};

const sanitizeItems = (items) =>
  items.map((item) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    total: item.total,
    note: item.note || "",
  }));

const buildOrderItems = async (items) => {
  const formattedItems = [];

  for (const itemInput of items) {
    const itemId = itemInput._id || itemInput.itemId || itemInput.id;
    const quantity = Number(itemInput.quantity);

    if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error("Invalid order item");
      error.statusCode = 400;
      throw error;
    }

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    formattedItems.push({
      name: item.name,
      price: item.price,
      quantity,
      total: item.price * quantity,
      note: itemInput.note || "",
    });
  }

  return formattedItems;
};

const getOrderByTableId = async (req, res) => {
  try {
    const tableId = Number(req.params.tableId);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid table id",
      });
    }

    const order = await Order.findOne({
      table: tableId,
      orderStatus: { $ne: "Completed" },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        items: sanitizeItems(order.items || []),
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const addOrder = async (req, res) => {
  try {
    const { items = [], customerDetails, table, paymentMethod } = req.body;
    const tableId = Number(table);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (
      !customerDetails?.name ||
      !customerDetails?.phone ||
      !customerDetails?.guests ||
      !Number.isInteger(tableId) ||
      tableId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer details and table are required",
      });
    }

    if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const selectedTable = await Table.findById(tableId);
    if (!selectedTable) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const formattedItems = await buildOrderItems(items);

    const newOrder = await Order.create({
      items: formattedItems,
      bills: calculateBills(formattedItems),
      customerDetails,
      table: tableId,
      paymentMethod: paymentMethod || null,
      orderStatus: "In Progress",
    });

    await Table.findOneAndUpdate(
      { _id: tableId },
      {
        status: "Booked",
        currentOrder: newOrder._id,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

const addItemToOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot add items to a completed order",
      });
    }

    const items = req.body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items selected",
      });
    }

    const formattedItems = await buildOrderItems(items);
    order.items.push(...formattedItems);
    order.bills = calculateBills(order.items);
    order.orderStatus = "In Progress";
    order.paymentMethod = null;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Items added successfully",
      data: order,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orderStatus === "Completed" && !order.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Customer has not paid yet",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    if (order.table) {
      const tableId = Number(order.table);

      await Table.findOneAndUpdate(
        { _id: tableId },
        orderStatus === "Completed"
          ? { status: "Available", currentOrder: null }
          : { status: "Booked", currentOrder: order._id }
      );
    }

    res.json({
      success: true,
      message: `Status updated to ${orderStatus}`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentMethod },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  addOrder,
  getOrders,
  getOrderById,
  getOrderByTableId,
  addItemToOrder,
  updateOrderStatus,
  updatePaymentMethod,
};