import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true, 
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    menuItems: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    totalPrice: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      default: "COD",
    },
    dateOrdered: {
      type: Date,
      default: Date.now,
    },
    branch: {
      type: String,
      required: true,
    },
    specialNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
