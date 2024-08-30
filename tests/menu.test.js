import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api/index"; // Adjust the path as needed
import Menu from "../api/models/menu.model"; // Adjust the path as needed
import Category from "../api/models/categories.model.js"; // Adjust the path as needed

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Seed data
  await Category.create({ name: "Category1" });
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Menu API", () => {
  let categoryId;

  beforeEach(async () => {
    // Get category ID for testing
    const category = await Category.findOne();
    categoryId = category._id;
  });

  test("POST /api/admin/add-menu - should create a new menu item", async () => {
    const response = await request(app).post("/api/admin/add-menu").send({
      title: "Test Menu",
      description: "Test Description",
      imageUrl: "http://testurl.com/image.jpg",
      price: 9.99,
      category: categoryId,
      offers: "10% off", // Now a string
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Menu Item Added Successfully");
  });

  test("GET /api/admin/get-menu - should return all menu items", async () => {
    const response = await request(app).get("/api/admin/get-menu");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/admin/get-menu-category/:categoryId - should return menu items by category", async () => {
    const response = await request(app).get(
      `/api/admin/get-menu-category/${categoryId}`
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("PUT /api/admin/update-menu/:id - should update a menu item", async () => {
    // Create a menu item first
    const menu = await Menu.create({
      title: "Old Title",
      description: "Old Description",
      imageUrl: "http://testurl.com/oldimage.jpg",
      price: 5.99,
      category: categoryId,
      offers: "20% off", // Now a string
    });

    const response = await request(app)
      .put(`/api/admin/update-menu/${menu._id}`)
      .send({
        title: "Updated Title",
        description: "Updated Description",
        imageUrl: "http://testurl.com/newimage.jpg",
        price: 6.99,
        category: categoryId,
        offers: "25% off", // Now a string
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Menu Item Updated");
  });

  test("DELETE /api/admin/delete-menu/:id - should delete a menu item", async () => {
    // Create a menu item first
    const menu = await Menu.create({
      title: "Item to Delete",
      description: "Description",
      imageUrl: "http://testurl.com/deleteimage.jpg",
      price: 7.99,
      category: categoryId,
      offers: "30% off", // Now a string
    });

    const response = await request(app).delete(
      `/api/admin/delete-menu/${menu._id}`
    );
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Menu Item Deleted");
  });
});
