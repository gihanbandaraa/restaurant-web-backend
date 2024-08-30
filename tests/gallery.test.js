import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../api/index';
import Gallery from '../api/models/gallery.model.js'; 

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

beforeEach(async () => {
  await Gallery.deleteMany({});
});

describe('Gallery API', () => {
  describe('POST /api/admin/add-image', () => {
    it('should add a new image', async () => {
      const response = await request(app).post('/api/admin/add-image').send({
        imageUrl: 'http://testurl.com/image.jpg',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Image Added Successfully');

      const image = await Gallery.findOne({ imageUrl: 'http://testurl.com/image.jpg' });
      expect(image).not.toBeNull();
    });

    it('should return an error if image URL is not provided', async () => {
      const response = await request(app).post('/api/admin/add-image').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Image URL is required');
    });
  });

  describe('GET /api/admin/get-images', () => {
    it('should retrieve all images', async () => {
      await Gallery.create({ imageUrl: 'http://testurl.com/image1.jpg' });
      await Gallery.create({ imageUrl: 'http://testurl.com/image2.jpg' });

      const response = await request(app).get('/api/admin/get-images');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('imageUrl', 'http://testurl.com/image1.jpg');
      expect(response.body[1]).toHaveProperty('imageUrl', 'http://testurl.com/image2.jpg');
    });

    it('should return an empty array if no images exist', async () => {
      const response = await request(app).get('/api/admin/get-images');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/admin/delete-image/:id', () => {
    it('should delete an existing image', async () => {
      const image = await Gallery.create({ imageUrl: 'http://testurl.com/image-to-delete.jpg' });

      const response = await request(app).delete(`/api/admin/delete-image/${image._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Image Deleted');

      const deletedImage = await Gallery.findById(image._id);
      expect(deletedImage).toBeNull();
    });

    it('should return an error if the image is not found', async () => {
      const response = await request(app).delete('/api/admin/delete-image/60c72b2f9b1d4b9e5a2b4e5c');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Image not found');
    });
  });
});
