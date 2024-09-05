import { addCategory, updateCategory, deleteCategory, getCategories } from "../api/controller/admin.controller.js";
import Category from "../api/models/categories.model.js";


jest.mock("../api/models/categories.model.js");

describe("Category Controllers", () => {

    describe("addCategory", () => {
      it("should add a new category", async () => {
        const req = {
          body: { name: "Appetizers" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
        Category.create.mockResolvedValue({ name: "Appetizers" });
  
        await addCategory(req, res, next);
  
        expect(Category.create).toHaveBeenCalledWith({ name: "Appetizers" });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          category: { name: "Appetizers" },
        });
      });
  
      it("should return an error if category name already exists", async () => {
        const req = {
          body: { name: "Appetizers" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  
        Category.create.mockRejectedValue({ code: 11000 });
  
        await addCategory(req, res, next);
  
        expect(Category.create).toHaveBeenCalledWith({ name: "Appetizers" });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Category name already exists!",
        });
      });
    });
  
    describe("updateCategory", () => {
      it("should update an existing category", async () => {
        const req = {
          params: { id: "123" },
          body: { name: "Starters" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  

        Category.findByIdAndUpdate.mockResolvedValue({ name: "Starters" });
  
        await updateCategory(req, res, next);
  
        expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
          "123",
          { name: "Starters" },
          { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          category: { name: "Starters" },
        });
      });
  
      it("should return an error if category is not found", async () => {
        const req = {
          params: { id: "123" },
          body: { name: "Starters" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  

        Category.findByIdAndUpdate.mockResolvedValue(null);
  
        await updateCategory(req, res, next);
  
        expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
          "123",
          { name: "Starters" },
          { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Category not found",
        });
      });
    });
  
    describe("deleteCategory", () => {
      it("should delete an existing category", async () => {
        const req = {
          params: { id: "123" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  
        // Mock Category.findByIdAndDelete
        Category.findByIdAndDelete.mockResolvedValue({ name: "Appetizers" });
  
        await deleteCategory(req, res, next);
  
        expect(Category.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Category deleted",
        });
      });
  
      it("should return an error if category is not found", async () => {
        const req = {
          params: { id: "123" },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  
        // Mock Category.findByIdAndDelete to return null
        Category.findByIdAndDelete.mockResolvedValue(null);
  
        await deleteCategory(req, res, next);
  
        expect(Category.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Category not found",
        });
      });
    });
  
    describe("getCategories", () => {
      it("should retrieve all categories", async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  
        // Mock Category.find
        Category.find.mockResolvedValue([
          { name: "Appetizers" },
          { name: "Main Courses" }
        ]);
  
        await getCategories(req, res, next);
  
        expect(Category.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
          { name: "Appetizers" },
          { name: "Main Courses" }
        ]);
      });
  
      it("should handle errors", async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();
  
        // Mock Category.find to throw an error
        Category.find.mockRejectedValue(new Error("Database error"));
  
        await getCategories(req, res, next);
  
        expect(Category.find).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(new Error("Database error"));
      });
    });
  
  });