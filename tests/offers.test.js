import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api/index";
import Offers from "../api/models/offers.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Offers.create([
    {
      title: "Weekend Feast",
      description:
        "Enjoy a lavish weekend feast with a 20% discount on all family platters. Treat your loved ones to a spread of our finest Sri Lankan dishes, including rice and curry, biriyani, and more. Perfect for sharing!",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/serendib-savor-db.appspot.com/o/offerImages%2F1724955817558_20%20Dis.jpg?alt=media&token=9a2c7bd5-112b-4e38-9d7f-0f71d60bda30",
      buttonText: "Get Now",
    },
    {
      title: "Happy Hour Delight",
      description:
        "Get 50% off on all beverages during our Happy Hour! Savor the refreshing taste of our tropical juices, cocktails, and more, available from 5 PM to 7 PM every day.",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/serendib-savor-db.appspot.com/o/offerImages%2F1724955850703_50%20Off.png?alt=media&token=2dac9250-c24f-4f5a-bef6-84e240a4e798",
      buttonText: "Grab the Deal",
    },
    {
      title: "Dessert Extravaganza",
      description:
        "Indulge in a free dessert of your choice with any 2 main course order. Choose from our delicious selection of Sri Lankan sweets, ice creams, and fruit-based desserts to finish your meal on a sweet note.",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/serendib-savor-db.appspot.com/o/offerImages%2F1724955908744_buy%201%20get%202.png?alt=media&token=7b1d3f81-02df-4257-bb50-ee8c27818f46",
      buttonText: "Claim Your Dessert",
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Offers API", () => {
  let offerId;

  beforeEach(async () => {
    const offer = await Offers.findOne();
    offerId = offer._id;
  });

  test("POST /api/admin/add-offer - should create a new offer", async () => {
    const response = await request(app).post("/api/admin/add-offer").send({
      title: "Holiday Special",
      description: "25% off on selected items",
      imageUrl: "http://testurl.com/holiday.jpg",
      buttonText: "Discover More",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Offer Added Successfully");

    const offer = await Offers.findOne({ title: "Holiday Special" });
    expect(offer).not.toBeNull();
    expect(offer.description).toBe("25% off on selected items");
  });

  test("GET /api/admin/get-offers - should retrieve all offers", async () => {
    const response = await request(app).get("/api/admin/get-offers");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(4);
    expect(response.body[0]).toHaveProperty("title", "Weekend Feast");
    expect(response.body[1]).toHaveProperty("title", "Happy Hour Delight");
    expect(response.body[2]).toHaveProperty("title", "Dessert Extravaganza");
  });

  test("PUT /api/admin/update-offer/:id - should update an existing offer", async () => {
    const response = await request(app)
      .put(`/api/admin/update-offer/${offerId}`)
      .send({
        title: "Updated Offer",
        description: "25% off on selected items",
        imageUrl: "http://testurl.com/updatedoffer.jpg",
        buttonText: "Update Offer",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Offer Updated");

    const offer = await Offers.findById(offerId);
    expect(offer.title).toBe("Updated Offer");
    expect(offer.description).toBe("25% off on selected items");
  });

  test("DELETE /api/admin/delete-offer/:id - should delete an existing offer", async () => {
    const response = await request(app).delete(
      `/api/admin/delete-offer/${offerId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Offer Deleted");

    const offer = await Offers.findById(offerId);
    expect(offer).toBeNull();
  });
});
