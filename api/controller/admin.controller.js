import Category from "../models/categories.model.js";

export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  try {
    const category = await Category.create({ name });
    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
