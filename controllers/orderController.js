const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Item = require("../models/itemModel");

// =====================================================
// 🔥 Helper: คำนวณราคารวมและภาษี
// =====================================================
const calculateBills = (items) => {

  const total = items.reduce(
    (sum, i) => sum + i.total,
    0
  );

  const tax = total * 0.0525;

  return {
    total,
    tax,
    totalWithTax: total + tax,
  };
};

// =====================================================
// 🔥 Helper: ล้างข้อมูล Item ก่อนส่งกลับ
// =====================================================
const sanitizeItems = (items) =>
  items.map((i) => ({
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    total: i.total,
  }));

// =====================================================
// 🔍 GET ORDER BY TABLE ID
// =====================================================
const getOrderByTableId = async (
  req,
  res
) => {

  try {

    const tableId =
      Number(req.params.tableId);

    console.log(
      "GET ORDER TABLE ID:",
      tableId
    );

    const order =
      await Order.findOne({
        table: tableId,
        orderStatus: {
          $ne: "Completed",
        },
      })
        .sort({
          createdAt: -1,
        })
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
        items: sanitizeItems(
          order.items || []
        ),
      },
    });

  } catch (err) {

    console.log(
      "GET ORDER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// 🆕 CREATE ORDER
// =====================================================
const addOrder = async (
  req,
  res
) => {

  try {

    const {
      items = [],
      customerDetails,
      table,
      paymentMethod,
    } = req.body;

    console.log(
      "CREATE ORDER BODY:",
      req.body
    );

    const tableId =
      Number(table);

    console.log(
      "TABLE ID:",
      tableId
    );

    const formattedItems = [];

    for (const i of items) {

      const item =
        await Item.findById(i._id);

      if (!item) continue;

      formattedItems.push({
        name: item.name,
        price: item.price,
        quantity: i.quantity,
        total:
          item.price * i.quantity,
      });
    }

    const newOrder =
      await Order.create({
        items: formattedItems,

        bills:
          calculateBills(
            formattedItems
          ),

        customerDetails,

        table: tableId,

        paymentMethod,

        orderStatus:
          "In Progress",
      });

    // ✅ update table
    if (tableId) {

      await Table.findOneAndUpdate(
        { _id: tableId },
        {
          status: "Booked",
          currentOrder:
            newOrder._id,
        }
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      data: newOrder,
    });

  } catch (err) {

    console.log(
      "CREATE ORDER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// 📄 GET ALL ORDERS
// =====================================================
const getOrders = async (
  req,
  res,
  next
) => {

  try {

    const orders =
      await Order.find().sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      data: orders,
    });

  } catch (err) {

    console.log(err);

    next(err);
  }
};

// =====================================================
// 🔍 GET ORDER BY ID
// =====================================================
const getOrderById = async (
  req,
  res,
  next
) => {

  try {

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });

  } catch (err) {

    console.log(err);

    next(err);
  }
};

// =====================================================
// ➕ ADD ITEM TO ORDER
// =====================================================
const addItemToOrder = async (
  req,
  res
) => {

  try {

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const items =
      req.body.items || [];

    for (const i of items) {

      const item =
        await Item.findById(i._id);

      if (!item) continue;

      const existing =
        order.items.find(
          (x) =>
            x.name === item.name
        );

      if (existing) {

        existing.quantity +=
          i.quantity;

        existing.total =
          existing.quantity *
          existing.price;

      } else {

        order.items.push({
          name: item.name,
          price: item.price,
          quantity: i.quantity,
          total:
            item.price *
            i.quantity,
        });
      }
    }

    order.bills =
      calculateBills(order.items);

    order.orderStatus =
      "In Progress";

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Items added successfully",
      data: order,
    });

  } catch (err) {

    console.log(
      "ADD ITEM ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// ✅ UPDATE ORDER STATUS
// =====================================================
const updateOrderStatus = async (
  req,
  res,
  next
) => {

  try {

    const { orderStatus } =
      req.body;

    const { id } = req.params;

    const order =
      await Order.findByIdAndUpdate(
        id,
        { orderStatus },
        { new: true }
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    if (order.table) {

      const tableId =
        Number(order.table);

      if (
        orderStatus ===
        "Completed"
      ) {

        await Table.findOneAndUpdate(
          { _id: tableId },
          {
            status:
              "available",

            currentOrder: null,
          }
        );

      } else {

        await Table.findOneAndUpdate(
          { _id: tableId },
          {
            status: "Booked",

            currentOrder:
              order._id,
          }
        );
      }
    }

    res.json({
      success: true,
      message:
        `Status updated to ${orderStatus}`,
      data: order,
    });

  } catch (err) {

    console.log(err);

    next(err);
  }
};

module.exports = {
  addOrder,
  getOrders,
  getOrderById,
  getOrderByTableId,
  addItemToOrder,
  updateOrderStatus,
};