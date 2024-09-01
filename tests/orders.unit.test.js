import supertest from "supertest";
import app from "../api/index.js";
import Order from "../api/models/orders.model.js";
import Menu from "../api/models/menu.model.js";
import {
  sendOrderReceivedEmail,
  sendOrderReadyEmail,
  sendOrderDeliveredEmail,
} from "../api/utils/mailer.js";

jest.mock("../api/models/orders.model.js");
jest.mock("../api/models/menu.model.js");
jest.mock("../api/utils/mailer.js");

describe("Order Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addOrder", () => {
    it("should create a new order and send an order received email", async () => {
      const order = {
        _id: "order123",
        menuItems: [
          {
            menuItemId: { title: "Pizza", price: 10, imageUrl: "url" },
            quantity: 2,
          },
        ],
        user: "user1",
        name: "Gihan Bandara",
        email: "gihanbandara999@gmail.com",
        shippingAddress: "123 Street",
        city: "City",
        phone: "1234567890",
        totalPrice: 20,
        orderId: "order123",
        paymentStatus: "Paid",
        branch: "Branch1",
        specialNotes: "None",
      };

      Menu.findById = jest.fn().mockResolvedValue({
        _id: "valid",
        title: "Pizza",
        price: 10,
        imageUrl: "url",
      });

      Order.create = jest.fn().mockResolvedValue(order);

      const res = await supertest(app)
        .post("/api/admin/add-order")
        .send({
          menuItems: [{ menuItemId: "valid", quantity: 2 }],
          user: "user1",
          name: "Gihan Bandara",
          email: "gihanbandara999@gmail.com",
          shippingAddress: "123 Street",
          city: "City",
          phone: "1234567890",
          totalPrice: 20,
          orderId: "order123",
          paymentStatus: "Paid",
          branch: "Branch1",
          specialNotes: "None",
        })
        .expect(201);

      expect(res.body.order).toEqual(order);
      expect(sendOrderReceivedEmail).toHaveBeenCalledWith(
        "gihanbandara999@gmail.com",
        expect.any(Object)
      );
    });

    it("should return an error if menu item is not found", async () => {
      Menu.findById = jest.fn().mockResolvedValue(null);

      const res = await supertest(app)
        .post("/api/admin/add-order")
        .send({
          menuItems: [{ menuItemId: "invalid", quantity: 2 }],
          user: "user1",
          name: "Gihan Bandara",
          email: "gihanbandara999@gmail.com",
          shippingAddress: "123 Street",
          city: "City",
          phone: "1234567890",
          totalPrice: 20,
          orderId: "order123",
          paymentStatus: "Paid",
          branch: "Branch1",
          specialNotes: "None",
        })
        .expect(500);

      expect(res.body.message).toContain("Menu item with ID invalid not found");
    });
  });

  describe("getOrders", () => {
    it("should fetch orders with correct filters and sorting", async () => {
      const orders = [{ _id: "order1", status: "Delivered" }];

      Order.find = jest.fn().mockReturnThis();
      Order.sort = jest.fn().mockReturnThis();
      Order.populate = jest.fn().mockResolvedValue(orders);

      const res = await supertest(app)
        .get("/api/admin/get-orders")
        .query({ status: "Delivered", sortBy: "createdAt", sortOrder: "desc" })
        .expect(200);

      expect(res.body).toEqual(orders);
    });
  });
});
