import Category from "../models/categories.model.js";
import Gallery from "../models/gallery.model.js";
import Menu from "../models/menu.model.js";
import Order from "../models/orders.model.js";
import Query from "../models/queries.model.js";
import Reservation from "../models/reservations.model.js";

import {
  sendConfirmationEmail,
  sendRejectionEmail,
  sendOrderReceivedEmail,
  sendOrderReadyEmail,
  sendOrderDeliveredEmail,
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
  if (!title || !description || !imageUrl || !price || !category || !offers) {
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

export const addQuery = async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const query = await Query.create({ name, email, message });
    return res
      .status(201)
      .json({ success: true, message: "Query Added Successfully" });
  } catch (error) {
    next(error);
  }
};
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
      return res
        .status(500)
        .json({
          message: "Order marked as delivered but failed to send email.",
        });
    }

    res.status(200).json({ message: "Order marked as delivered." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark order as delivered." });
  }
};
