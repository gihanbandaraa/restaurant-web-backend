import request from "supertest";
import app from "../api/index";
import Category from "../api/models/categories.model";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Category.deleteMany({});
});

describe("Category Routes", () => {

  describe("POST /api/admin/add-category", () => {
    it("should add a new food category", async () => {
      const response = await request(app).post("/api/admin/add-category").send({
        name: "Appetizers",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toHaveProperty("name", "Appetizers");

      const category = await Category.findOne({ name: "Appetizers" });
      expect(category).not.toBeNull();
    });

    it("should return an error if food category name already exists", async () => {
      await Category.create({ name: "Appetizers" });

      const response = await request(app).post("/api/admin/add-category").send({
        name: "Appetizers",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Category name already exists!");
    });
  });

  describe("PUT /api/admin/update-category/:id", () => {
    it("should update an existing food category", async () => {
      const category = await Category.create({ name: "Appetizers" });

      const response = await request(app).put(`/api/admin/update-category/${category._id}`).send({
        name: "Starters",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toHaveProperty("name", "Starters");
    });

    it("should return an error if the food category is not found", async () => {
      const response = await request(app).put("/api/admin/update-category/60c72b2f9b1d4b9e5a2b4e5c").send({
        name: "Main Courses",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Category not found");
    });
  });

  

  describe("DELETE /api/admin/delete-category/:id", () => {
    it("should delete an existing food category", async () => {
      const category = await Category.create({ name: "Appetizers" });

      const response = await request(app).delete(`/api/admin/delete-category/${category._id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Category deleted");

      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it("should return an error if the food category is not found", async () => {
      const response = await request(app).delete("/api/admin/delete-category/60c72b2f9b1d4b9e5a2b4e5c");

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Category not found");
    });
  });

  describe("GET /api/admin/get-categories", () => {
    it("should retrieve all food categories", async () => {
      await Category.create({ name: "Appetizers" });
      await Category.create({ name: "Main Courses" });

      const response = await request(app).get("/api/admin/get-categories");

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("name", "Appetizers");
      expect(response.body[1]).toHaveProperty("name", "Main Courses");
    });

    it("should return an empty array if no food categories exist", async () => {
      const response = await request(app).get("/api/admin/get-categories");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
