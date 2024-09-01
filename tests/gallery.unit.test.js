import { addImage, getImages, deleteImage } from '../api/controller/admin.controller.js'; // Import your controller functions
import Gallery from '../api/models/gallery.model.js'; // Import the Gallery model

// Mock the Gallery model
jest.mock('../api/models/gallery.model.js');

describe('Gallery Controllers', () => {
  
  describe('addImage', () => {
    it('should add a new image', async () => {
      const req = {
        body: { imageUrl: 'http://testurl.com/image.jpg' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock Gallery.create
      Gallery.create.mockResolvedValue({ imageUrl: 'http://testurl.com/image.jpg' });

      await addImage(req, res, next);

      expect(Gallery.create).toHaveBeenCalledWith({ imageUrl: 'http://testurl.com/image.jpg' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Image Added Successfully',
      });
    });

    it('should return an error if image URL is not provided', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await addImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Image URL is required',
      });
    });
  });

  describe('getImages', () => {
    it('should retrieve all images', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock Gallery.find
      Gallery.find.mockResolvedValue([
        { imageUrl: 'http://testurl.com/image1.jpg' },
        { imageUrl: 'http://testurl.com/image2.jpg' }
      ]);

      await getImages(req, res, next);

      expect(Gallery.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { imageUrl: 'http://testurl.com/image1.jpg' },
        { imageUrl: 'http://testurl.com/image2.jpg' }
      ]);
    });

    it('should return an empty array if no images exist', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock Gallery.find to return an empty array
      Gallery.find.mockResolvedValue([]);

      await getImages(req, res, next);

      expect(Gallery.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('deleteImage', () => {
    it('should delete an existing image', async () => {
      const req = {
        params: { id: '123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock Gallery.findByIdAndDelete
      Gallery.findByIdAndDelete.mockResolvedValue({ imageUrl: 'http://testurl.com/image-to-delete.jpg' });

      await deleteImage(req, res, next);

      expect(Gallery.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Image Deleted',
      });
    });

    it('should return an error if the image is not found', async () => {
      const req = {
        params: { id: '123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock Gallery.findByIdAndDelete to return null
      Gallery.findByIdAndDelete.mockResolvedValue(null);

      await deleteImage(req, res, next);

      expect(Gallery.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Image not found',
      });
    });
  });

});
