import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api/index";
import Order from "../api/models/orders.model.js";
import Menu from "../api/models/menu.model.js";
import Category from "../api/models/categories.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  const category = await Category.create({ name: "Fast Food" });

  const menuItem = await Menu.create({
    title: "Burger",
    price: 10.99,
    imageUrl: "burger.jpg",
    category: category._id,
    description: "A delicious beef burger with lettuce and tomato",
  });

  await Order.create({
    user: new mongoose.Types.ObjectId(),
    orderId: "ORD123",
    name: "Gihan Bandara",
    email: "gihanbandara999@gmail.com",
    menuItems: [
      {
        menuItemId: menuItem._id,
        quantity: 2,
      },
    ],
    shippingAddress: "123 Main St",
    city: "New York",
    phone: "555-555-5555",
    totalPrice: 21.98,
    branch: "Main Branch",
    specialNotes: "No onions, please.",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Orders API", () => {
  let orderId;

  beforeEach(async () => {
    const order = await Order.findOne();
    orderId = order._id;
  });

  test("POST /api/admin/add-order - should create a new order", async () => {
    const menuItem = await Menu.findOne({ title: "Burger" });

    const response = await request(app)
      .post("/api/admin/add-order")
      .send({
        user: new mongoose.Types.ObjectId(),
        orderId: "ORD124",
        name: "Gihan Bandara",
        email: "gihanbandara999@gmail.com",
        menuItems: [
          {
            menuItemId: menuItem._id,
            quantity: 3,
          },
        ],
        shippingAddress: "456 Maple St",
        city: "Los Angeles",
        phone: "666-666-6666",
        totalPrice: 32.97,
        branch: "West Branch",
        specialNotes: "Extra ketchup.",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.order.name).toBe("Gihan Bandara");
  }, 15000);

  test("GET /api/admin/get-orders - should retrieve all orders", async () => {
    const response = await request(app).get("/api/admin/get-orders");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("PUT /api/admin/mark-order-as-ready/:id - should mark an order as ready", async () => {
    const response = await request(app)
      .put(`/api/admin/mark-order-as-ready/${orderId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order marked as ready.");
  },15000);

  test("PUT /api/admin/mark-order-as-delivered/:id - should mark an order as delivered", async () => {
    const response = await request(app)
      .put(`/api/admin/mark-order-as-delivered/${orderId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order marked as delivered.");
  },15000);
});
