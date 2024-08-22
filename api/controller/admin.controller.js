import Category from "../models/categories.model.js";
import Gallery from "../models/gallery.model.js";
import Menu from "../models/menu.model.js";
import Offers from "../models/offers.model.js";
import Order from "../models/orders.model.js";
import Query from "../models/queries.model.js";
import Reservation from "../models/reservations.model.js";
import User from "../models/user.model.js";

import {
  sendConfirmationEmail,
  sendRejectionEmail,
  sendOrderReceivedEmail,
  sendOrderReadyEmail,
  sendOrderDeliveredEmail,
  sendQueryReplyEmail,
} from "../utils/mailer.js";

//Related to Category
export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  try {
    const category = await Category.create({ name });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists!",
      });
    }
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

//Related to Menu
export const addMenu = async (req, res, next) => {
  const { title, description, imageUrl, price, category, offers } = req.body;
  if (!title || !description || !imageUrl || !price || !category ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const menu = await Menu.create({
      title,
      description,
      imageUrl,
      price,
      category,
      offers,
    });
    return res
      .status(201)
      .json({ success: true, message: "Menu Item Added Successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.find();
    return res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

export const getMenuByCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const menu = await Menu.find({ category: categoryId });
    return res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (req, res, next) => {
  const { title, description, imageUrl, price, category, offers } = req.body;
  const { id } = req.params;

  try {
    const menu = await Menu.findByIdAndUpdate(
      id,
      { title, description, imageUrl, price, category, offers },
      { new: true }
    );

    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu Item not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Menu Item Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req, res, next) => {
  const { id } = req.params;

  try {
    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu Item not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Menu Item Deleted" });
  } catch (error) {
    next(error);
  }
};

export const getCategoryCounts = async (req, res, next) => {
  try {
    const counts = await Category.aggregate([
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "category",
          as: "items",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          itemCount: { $size: "$items" },
        },
      },
    ]);

    return res.status(200).json(counts);
  } catch (error) {
    next(error);
  }
};

//Manage Gallery
export const addImage = async (req, res, next) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res
      .status(400)
      .json({ success: false, message: "Image URL is required" });
  }
  try {
    const image = await Gallery.create({ imageUrl });
    return res
      .status(201)
      .json({ success: true, message: "Image Added Successfully" });
  } catch (error) {
    next(error);
  }
};

export const getImages = async (req, res, next) => {
  try {
    const images = await Gallery.find();
    return res.status(200).json(images);
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const image = await Gallery.findByIdAndDelete(id);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    return res.status(200).json({ success: true, message: "Image Deleted" });
  } catch (error) {
    next(error);
  }
};

//Manage Reservations
export const getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find();
    const formattedReservations = reservations.map((reservation) => ({
      ...reservation.toObject(),
      date: reservation.date.toISOString().split("T")[0],
    }));

    return res.status(200).json(formattedReservations);
  } catch (error) {
    next(error);
  }
};

export const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    try {
      await sendConfirmationEmail(reservation.email, {
        date: reservation.date.toISOString().split("T")[0],
        time: reservation.time,
        people: reservation.people,
        branch: reservation.branch,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      return res
        .status(500)
        .json({ message: "Reservation confirmed but failed to send email." });
    }

    res.status(200).json({ message: "Reservation confirmed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm the reservation." });
  }
};

export const rejectReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    await Reservation.findByIdAndUpdate(req.params.id, { status: "rejected" });
    await sendRejectionEmail(reservation.email, reservation);

    res
      .status(200)
      .json({ message: "Reservation rejected successfully and email sent!" });
  } catch (error) {
    console.error("Error rejecting reservation:", error);
    res.status(500).json({ message: "Failed to reject the reservation." });
  }
};

//Manage Queries

export const getQueries = async (req, res, next) => {
  try {
    const queries = await Query.find();
    return res.status(200).json(queries);
  } catch (error) {
    next(error);
  }
};

export const deleteQuery = async (req, res, next) => {
  const { id } = req.params;

  try {
    const query = await Query.findByIdAndDelete(id);
    if (!query) {
      return res
        .status(404)
        .json({ success: false, message: "Query not found" });
    }
    return res.status(200).json({ success: true, message: "Query Deleted" });
  } catch (error) {
    next(error);
  }
};

export const replyQuery = async (req, res, next) => {
  const { id } = req.params;
  const { subject, message, receiverEmail, status } = req.body;

  try {
    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedQuery) {
      return res
        .status(404)
        .json({ success: false, message: "Query not found" });
    }

    await sendQueryReplyEmail(receiverEmail, {
      subject,
      message,
      receiverName: updatedQuery.name,
    });

    return res.status(200).json({ success: true, status: updatedQuery });
  } catch (error) {
    console.error("Error handling query reply:", error);
    next(error);
  }
};

//Related Manage Orders

export const addOrder = async (req, res, next) => {
  const {
    user,
    name,
    email,
    menuItems,
    shippingAddress,
    city,
    phone,
    totalPrice,
    orderId,
    paymentStatus,
    branch,
    specialNotes,
  } = req.body;

  try {
    const order = await Order.create({
      user,
      name,
      email,
      menuItems,
      shippingAddress,
      city,
      phone,
      totalPrice,
      orderId,
      paymentStatus,
      branch,
      specialNotes,
    });

    const items = await Promise.all(
      menuItems.map(async (item) => {
        try {
          const menuItem = await Menu.findById(item.menuItemId);
          if (!menuItem) {
            throw new Error(`Menu item with ID ${item.menuItemId} not found`);
          }
          return {
            name: menuItem.title,
            price: menuItem.price,
            quantity: item.quantity,
            imageUrl: menuItem.imageUrl,
          };
        } catch (error) {
          console.error(
            `Error fetching menu item with ID ${item.menuItemId}:`,
            error.message
          );
          throw error;
        }
      })
    );

    try {
      await sendOrderReceivedEmail(email, {
        name,
        orderId,
        totalPrice,
        shippingAddress,
        city,
        items,
        branch,
      });
      console.log("Order received email sent successfully");
    } catch (emailError) {
      console.error("Error sending order received email:", emailError.message);
    }
    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error adding order:", error.message);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { status, sortBy, sortOrder, branch, user } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (user) filter.user = user;

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }
    const orders = await Order.find(filter)
      .sort(sortOptions)
      .populate("menuItems.menuItemId", "title price imageUrl");

    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const markOrderAsReady = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "menuItems.menuItemId",
      "title price imageUrl"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Ready" },
      { new: true }
    );
    const items = order.menuItems.map((item) => ({
      name: item.menuItemId.title,
      price: item.menuItemId.price,
      quantity: item.quantity,
      imageUrl: item.menuItemId.imageUrl,
    }));

    try {
      await sendOrderReadyEmail(order.email, {
        name: order.name,
        orderId: order.orderId,
        items,
        branch: order.branch,
      });
      console.log("Order ready email sent successfully");
    } catch (emailError) {
      console.error("Error sending order ready email:", emailError.message);
      return res
        .status(500)
        .json({ message: "Order marked as ready but failed to send email." });
    }

    res.status(200).json({ message: "Order marked as ready." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark order as ready." });
  }
};

export const markOrderAsDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "menuItems.menuItemId",
      "title price imageUrl"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Delivered" },
      { new: true }
    );

    const items = order.menuItems.map((item) => ({
      name: item.menuItemId.title,
      price: item.menuItemId.price,
      quantity: item.quantity,
      imageUrl: item.menuItemId.imageUrl,
    }));
    try {
      await sendOrderDeliveredEmail(order.email, {
        name: order.name,
        orderId: order.orderId,
        items,
        branch: order.branch,
      });
      console.log("Order delivered email sent successfully");
    } catch (emailError) {
      console.error("Error sending order delivered email:", emailError.message);
      return res.status(500).json({
        message: "Order marked as delivered but failed to send email.",
      });
    }

    res.status(200).json({ message: "Order marked as delivered." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark order as delivered." });
  }
};

//Related to Offers
export const addOffer = async (req, res, next) => {
  const { title, description, imageUrl, buttonText } = req.body;
  if (!title || !description || !imageUrl || !buttonText) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const offer = await Offers.create({
      title,
      description,
      imageUrl,
      buttonText,
    });
    return res
      .status(201)
      .json({ success: true, message: "Offer Added Successfully" });
  } catch (error) {
    next(error);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const offers = await Offers.find();
    return res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  const { title, description, imageUrl, buttonText } = req.body;
  const { id } = req.params;

  try {
    const offer = await Offers.findByIdAndUpdate(
      id,
      { title, description, imageUrl, buttonText },
      { new: true }
    );

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
    return res.status(200).json({ success: true, message: "Offer Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  const { id } = req.params;

  try {
    const offer = await Offers.findByIdAndDelete(id);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
    return res.status(200).json({ success: true, message: "Offer Deleted" });
  } catch (error) {
    next(error);
  }
};

//Admin Dashboard

export const getDashboardData = async (req, res) => {
  try {
    const revenueByDay = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateOrdered" } },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalOrders = await Order.countDocuments();

    const avgOrderValue = totalRevenue[0].total / totalOrders;

    res.json({
      revenueByDay,
      ordersByStatus,
      totalRevenue: totalRevenue[0].total,
      totalOrders,
      avgOrderValue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
export const getTopMenuItems = async (req, res) => {
  try {
    const topItems = await Order.aggregate([
      { $unwind: "$menuItems" },
      {
        $group: {
          _id: "$menuItems.menuItemId",
          totalQuantity: { $sum: "$menuItems.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $project: {
          _id: 0,
          menuItemId: "$_id",
          name: "$menuItem.title",
          imageUrl: "$menuItem.imageUrl",
          totalQuantity: 1,
        },
      },
    ]);

    res.json(topItems);
  } catch (error) {
    console.error("Error fetching top menu items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSalesPerformance = async (req, res) => {
  try {
    const { filter } = req.query;

    let startDate;
    const endDate = new Date();

    let groupFormat;

    switch (filter) {
      case "today":
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%m-%d";
        break;
      case "last7Days":
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        groupFormat = "%Y-%m-%d";
        break;
      case "last30Days":
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);
        groupFormat = "%Y-%m-%d";
        break;
      case "last6Months":
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 6);
        groupFormat = "%Y-%m";
        break;
      case "lastYear":
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        groupFormat = "%Y-%m";
        break;
      default:
        startDate = new Date(0);
        groupFormat = "%Y-%m";
        break;
    }

    endDate.setHours(23, 59, 59, 999);

    const salesPerformance = await Order.aggregate([
      {
        $match: {
          dateOrdered: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$dateOrdered" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesPerformance);
  } catch (error) {
    console.error("Error fetching sales performance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ dateOrdered: -1 }).limit(5);

    res.json(recentOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const newUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });
    const activeUsers = await User.countDocuments({
      lastLogin: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });

    res.json({ newUsers, activeUsers });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ isStaff: true });
    res.status(200).json(staff);
  } catch (error) {
    next(errorHandler(500, "Error fetching staff accounts"));
  }
};

export const updateStaffAccount = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedStaff || !updatedStaff.isStaff) {
      return next(errorHandler(404, "Staff account not found"));
    }

    res.status(200).json(updatedStaff);
  } catch (error) {
    next(errorHandler(500, "Error updating staff account"));
  }
};
export const deleteStaffAccount = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedStaff = await User.findByIdAndDelete(id);

    if (!deletedStaff || !deletedStaff.isStaff) {
      return next(errorHandler(404, "Staff account not found"));
    }

    res.status(200).json({ message: "Staff account deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting staff account"));
  }
};
