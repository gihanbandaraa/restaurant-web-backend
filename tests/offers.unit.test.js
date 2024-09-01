import { addOffer, getOffers, updateOffer } from '../api/controller/admin.controller';
import Offers from '../api/models/offers.model.js';

jest.mock('../api/models/offers.model.js');

describe('Admin Controller - Offers', () => {
  describe('addOffer', () => {
    it('should add a new offer', async () => {
      const req = {
        body: {
          title: 'New Offer',
          description: 'This is a new offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Click here',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const offerData = {
        _id: 'someofferid',
        title: 'New Offer',
        description: 'This is a new offer',
        imageUrl: 'http://example.com/image.jpg',
        buttonText: 'Click here',
      };

      Offers.create.mockResolvedValue(offerData);

      await addOffer(req, res, next);

      expect(Offers.create).toHaveBeenCalledWith({
        title: 'New Offer',
        description: 'This is a new offer',
        imageUrl: 'http://example.com/image.jpg',
        buttonText: 'Click here',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Offer Added Successfully',
        success: true
      });
    });

    it('should handle validation error', async () => {
      const req = {
        body: {
          title: 'New Offer',
          description: 'This is a new offer',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await addOffer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All fields are required',
        success: false
      });
    });

    it('should handle server error', async () => {
      const req = {
        body: {
          title: 'New Offer',
          description: 'This is a new offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Click here',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const error = new Error('Something went wrong');
      Offers.create.mockRejectedValue(error);

      await addOffer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getOffers', () => {
    it('should return all offers', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const offersData = [
        {
          _id: 'offerid1',
          title: 'Offer 1',
          description: 'Description 1',
          imageUrl: 'http://example.com/image1.jpg',
          buttonText: 'Buy Now',
        },
        {
          _id: 'offerid2',
          title: 'Offer 2',
          description: 'Description 2',
          imageUrl: 'http://example.com/image2.jpg',
          buttonText: 'Shop Now',
        },
      ];

      Offers.find.mockResolvedValue(offersData);

      await getOffers(req, res, next);

      expect(Offers.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(offersData);
    });

    it('should handle server error', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const error = new Error('Something went wrong');
      Offers.find.mockRejectedValue(error);

      await getOffers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateOffer', () => {
    it('should update an existing offer', async () => {
      const req = {
        params: { id: 'someofferid' },
        body: {
          title: 'Updated Offer',
          description: 'This is an updated offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Updated Button',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const updatedOfferData = {
        _id: 'someofferid',
        title: 'Updated Offer',
        description: 'This is an updated offer',
        imageUrl: 'http://example.com/image.jpg',
        buttonText: 'Updated Button',
      };

      Offers.findByIdAndUpdate.mockResolvedValue(updatedOfferData);

      await updateOffer(req, res, next);

      expect(Offers.findByIdAndUpdate).toHaveBeenCalledWith(
        'someofferid',
        {
          title: 'Updated Offer',
          description: 'This is an updated offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Updated Button',
        },
        { new: true }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Offer Updated',
        success: true
      });
    });

    it('should return 404 if offer not found', async () => {
      const req = {
        params: { id: 'nonexistentid' },
        body: {
          title: 'Updated Offer',
          description: 'This is an updated offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Updated Button',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      Offers.findByIdAndUpdate.mockResolvedValue(null);

      await updateOffer(req, res, next);

      expect(Offers.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistentid',
        {
          title: 'Updated Offer',
          description: 'This is an updated offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Updated Button',
        },
        { new: true }
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Offer not found',
        success: false
      });
    });

    it('should handle server error', async () => {
      const req = {
        params: { id: 'someofferid' },
        body: {
          title: 'Updated Offer',
          description: 'This is an updated offer',
          imageUrl: 'http://example.com/image.jpg',
          buttonText: 'Updated Button',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const error = new Error('Something went wrong');
      Offers.findByIdAndUpdate.mockRejectedValue(error);

      await updateOffer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
