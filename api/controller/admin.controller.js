import Category from "../models/categories.model.js";
import Gallery from "../models/gallery.model.js";
import Menu from "../models/menu.model.js";

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
