import { addMenu, getMenu, getMenuByCategory, updateMenu, deleteMenu } from '../api/controller/admin.controller.js';
import Menu from '../api/models/menu.model.js'; 
import Category from '../api/models/categories.model.js'; 


jest.mock('../api/models/menu.model.js');
jest.mock('../api/models/categories.model.js');

describe('Menu Controllers', () => {
  
  let categoryId;

  beforeAll(() => {
    Category.findOne.mockResolvedValue({ _id: '60c72b2f9b1d4b9e5a2b4e5c' });
    categoryId = '60c72b2f9b1d4b9e5a2b4e5c';
  });

  describe('addMenu', () => {
    it('should create a new menu item', async () => {
      const req = {
        body: {
          title: 'Test Menu',
          description: 'Test Description',
          imageUrl: 'http://testurl.com/image.jpg',
          price: 9.99,
          category: categoryId,
          offers: '10% off',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Menu.create.mockResolvedValue(req.body);

      await addMenu(req, res, next);

      expect(Menu.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Menu Item Added Successfully',
      });
    });

    it('should return an error if data is missing', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await addMenu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required',
      });
    });
  });

  describe('getMenu', () => {
    it('should retrieve all menu items', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Menu.find.mockResolvedValue([
        { title: 'Test Menu 1', description: 'Test Description 1' },
        { title: 'Test Menu 2', description: 'Test Description 2' }
      ]);

      await getMenu(req, res, next);

      expect(Menu.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { title: 'Test Menu 1', description: 'Test Description 1' },
        { title: 'Test Menu 2', description: 'Test Description 2' }
      ]);
    });
  });

  describe('getMenuByCategory', () => {
    it('should retrieve menu items by category', async () => {
      const req = {
        params: { categoryId },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      Menu.find.mockResolvedValue([
        { title: 'Test Menu in Category', description: 'Test Description', category: categoryId }
      ]);

      await getMenuByCategory(req, res, next);

      expect(Menu.find).toHaveBeenCalledWith({ category: categoryId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { title: 'Test Menu in Category', description: 'Test Description', category: categoryId }
      ]);
    });
  });

  describe('updateMenu', () => {
    it('should update a menu item', async () => {
      const req = {
        params: { id: '60c72b2f9b1d4b9e5a2b4e5c' },
        body: {
          title: 'Updated Title',
          description: 'Updated Description',
          imageUrl: 'http://testurl.com/newimage.jpg',
          price: 6.99,
          category: categoryId,
          offers: '25% off',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Menu.findByIdAndUpdate.mockResolvedValue(req.body);

      await updateMenu(req, res, next);

      expect(Menu.findByIdAndUpdate).toHaveBeenCalledWith(
        '60c72b2f9b1d4b9e5a2b4e5c',
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Menu Item Updated',
      });
    });

    it('should return an error if menu item is not found', async () => {
      const req = {
        params: { id: '60c72b2f9b1d4b9e5a2b4e5c' },
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Menu.findByIdAndUpdate.mockResolvedValue(null);

      await updateMenu(req, res, next);

      expect(Menu.findByIdAndUpdate).toHaveBeenCalledWith(
        '60c72b2f9b1d4b9e5a2b4e5c',
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Menu Item not found',
      });
    });
  });

  describe('deleteMenu', () => {
    it('should delete a menu item', async () => {
      const req = {
        params: { id: '60c72b2f9b1d4b9e5a2b4e5c' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Menu.findByIdAndDelete.mockResolvedValue({ title: 'Item to Delete' });

      await deleteMenu(req, res, next);

      expect(Menu.findByIdAndDelete).toHaveBeenCalledWith('60c72b2f9b1d4b9e5a2b4e5c');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Menu Item Deleted',
      });
    });

    it('should return an error if menu item is not found', async () => {
      const req = {
        params: { id: '60c72b2f9b1d4b9e5a2b4e5c' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      Menu.findByIdAndDelete.mockResolvedValue(null);

      await deleteMenu(req, res, next);

      expect(Menu.findByIdAndDelete).toHaveBeenCalledWith('60c72b2f9b1d4b9e5a2b4e5c');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Menu Item not found',
      });
    });
  });
});
