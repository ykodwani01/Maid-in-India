// maidService.test.js
const {
  getProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
  searchMaid,
  createBooking,
  bookingConfirm,
  cancelBooking,
  getBookings,
  getBookingsById
} = require('../src/services/maidService');

const Maid = require('../src/models/Maid');
const Booking = require('../src/models/Booking');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Mock external modules and models
jest.mock('../src/models/Maid');
jest.mock('../src/models/Booking');
jest.mock('axios');

describe('Maid Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the maid profile', async () => {
      const profileData = { maidId: '123', name: 'Test Maid' };
      Maid.findByPk.mockResolvedValue(profileData);

      const result = await getProfile('123');
      expect(Maid.findByPk).toHaveBeenCalledWith('123');
      expect(result).toEqual(profileData);
    });

    it('should throw an error when finding profile fails', async () => {
      Maid.findByPk.mockRejectedValue(new Error('DB error'));
      await expect(getProfile('123')).rejects.toThrow('Error fetching profile: DB error');
    });
  });

  describe("updateProfile", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should update the maid profile successfully", async () => {
      const maidObj = {
        maidId: "123",
        name: "Old Name",
        gender: null,
        location: null,
        govtId: null,
        imageUrl: null,
        timeAvailable: null,
        cleaning: null,
        cooking: null,
        update: jest.fn().mockResolvedValue(true)
      };
  
      Maid.findByPk.mockResolvedValue(maidObj);
  
      const updatedData = {
        name: "New Name",
        gender: "F",
        location: "NY",
        govtId: "ID123",
        imageUrl: "img.png",
        timeAvailable: { Monday: ["10AM"] },
        cleaning: true,
        cooking: true
      };
  
      const result = await updateProfile("123", updatedData);
  
      expect(Maid.findByPk).toHaveBeenCalledWith("123");
      expect(maidObj.update).toHaveBeenNthCalledWith(1, updatedData);
      expect(result).toBe(maidObj);
    });
  
    it("should set profileCreated to true when all fields are filled", async () => {
      const maidObj = {
        maidId: "123",
        name: "New Name",
        gender: "F",
        location: "NY",
        govtId: "ID123",
        imageUrl: "img.png",
        timeAvailable: { Monday: ["10AM"] },
        cleaning: true,
        cooking: true,
        update: jest.fn().mockResolvedValue(true)
      };
  
      Maid.findByPk.mockResolvedValue(maidObj);
  
      const updatedData = {
        name: "New Name",
        gender: "F",
        location: "NY",
        govtId: "ID123",
        imageUrl: "img.png",
        timeAvailable: { Monday: ["10AM"] },
        cleaning: true,
        cooking: true
      };
  
      await updateProfile("123", updatedData);
  
      expect(maidObj.update).toHaveBeenNthCalledWith(1, updatedData);
      expect(maidObj.update).toHaveBeenNthCalledWith(2, { profileCreated: true });
    });
  
    it("should not set profileCreated to true if some fields are missing", async () => {
      const maidObj = {
        maidId: "123",
        name: "New Name",
        gender: "F",
        location: "NY",
        govtId: null, // Missing field
        imageUrl: "img.png",
        timeAvailable: { Monday: ["10AM"] },
        cleaning: true,
        cooking: true,
        update: jest.fn().mockResolvedValue(true)
      };
  
      Maid.findByPk.mockResolvedValue(maidObj);
  
      const updatedData = {
        name: "New Name",
        gender: "F",
        location: "NY",
        govtId: null, // Missing field
        imageUrl: "img.png",
        timeAvailable: { Monday: ["10AM"] },
        cleaning: true,
        cooking: true
      };
  
      await updateProfile("123", updatedData);
  
      expect(maidObj.update).toHaveBeenNthCalledWith(1, updatedData);
      expect(maidObj.update).not.toHaveBeenNthCalledWith(2, { profileCreated: true });
    });
  
    it("should throw an error if the maid is not found", async () => {
      Maid.findByPk.mockResolvedValue(null);
      await expect(updateProfile("123", {})).rejects.toThrow("Maid not found");
    });
  
    it("should throw an error if updating fails", async () => {
      const maidObj = {
        update: jest.fn().mockRejectedValue(new Error("DB error"))
      };
  
      Maid.findByPk.mockResolvedValue(maidObj);
  
      await expect(updateProfile("123", {})).rejects.toThrow("Error updating profile: DB error");
    });
  });

  describe('sendOtp', () => {
    it('should send OTP and return a success message', async () => {
      const axiosResponse = { data: {} };
      axios.post.mockResolvedValue(axiosResponse);
      const result = await sendOtp('+1234567890');

      expect(axios.post).toHaveBeenCalled();
      expect(result).toEqual({ message: 'OTP sent successfully' });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return token with maid data when approved (maid does not exist)', async () => {
      // Simulate OTP verification response from Twilio
      axios.post.mockResolvedValue({ data: { status: 'approved' } });
      // Simulate that no maid is found and so create is called
      Maid.findOne.mockResolvedValue(null);
      const maidCreateObj = { maidId: '123', contact: '+1234567890' };
      Maid.create.mockResolvedValue(maidCreateObj);
      const token = 'dummy-token';
      jwt.sign = jest.fn().mockReturnValue(token);

      const result = await verifyOtp('+1234567890', '123456');
      expect(axios.post).toHaveBeenCalled();
      expect(Maid.create).toHaveBeenCalled();
      expect(result).toEqual({ token, maid: { id: '123', contact: '+1234567890' } });
    });

    it('should verify OTP and return token with maid data when approved (maid exists)', async () => {
      axios.post.mockResolvedValue({ data: { status: 'approved' } });
      const maidFound = { maidId: '456', contact: '+1234567890' };
      Maid.findOne.mockResolvedValue(maidFound);
      const token = 'dummy-token-2';
      jwt.sign = jest.fn().mockReturnValue(token);

      const result = await verifyOtp('+1234567890', '654321');
      expect(Maid.findOne).toHaveBeenCalled();
      expect(result).toEqual({ token, maid: { id: '456', contact: '+1234567890' } });
    });

    it('should throw an error when OTP verification fails', async () => {
      axios.post.mockResolvedValue({ data: { status: 'pending' } });
      await expect(verifyOtp('+1234567890', '000000')).rejects.toThrow('OTP verification failed');
    });
  });

  describe("searchMaid - Day Filtering", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should return maids that provide cleaning service available on Monday when type=1", async () => {
      // Create a list of maids with cleaning service.
      // Only maid A has availability on Monday.
      const maids = [
        { 
          maidId: "A", 
          location: "NY", 
          cleaning: "true", 
          timeAvailable: { Monday: ["10AM"], Tuesday: ["11AM"] } 
        },
        { 
          maidId: "B", 
          location: "NY", 
          cleaning: "true", 
          timeAvailable: { Tuesday: ["10AM"] } 
        },
        { 
          maidId: "C", 
          location: "NY", 
          cleaning: "true", 
          timeAvailable: {} 
        }
      ];
      Maid.findAll.mockResolvedValue(maids);
  
      const result = await searchMaid({ location: "NY", service: "cleaning", type: 1 });
      expect(Maid.findAll).toHaveBeenCalledWith({ where: { location: "NY", cleaning: "true" } });
      // Expect only maid A (with Monday availability) to be returned.
      expect(result).toEqual([maids[0]]);
    });
  
    it("should return maids that provide cooking service available on Tuesday when type=2", async () => {
      // Create a list of maids with cooking service.
      // Only maid D is available on Tuesday.
      const maids = [
        { 
          maidId: "D", 
          location: "NY", 
          cooking: "true", 
          timeAvailable: { Tuesday: ["10AM"] } 
        },
        { 
          maidId: "E", 
          location: "NY", 
          cooking: "true", 
          timeAvailable: { Monday: ["10AM"] } 
        }
      ];
      Maid.findAll.mockResolvedValue(maids);
  
      const result = await searchMaid({ location: "NY", service: "cooking", type: 2 });
      expect(Maid.findAll).toHaveBeenCalledWith({ where: { location: "NY", cooking: "true" } });
      // Expect only maid D (with Tuesday availability) to be returned.
      expect(result).toEqual([maids[0]]);
    });

  
  
    it("should throw an error if searching fails", async () => {
      Maid.findAll.mockRejectedValue(new Error("Database error"));
      await expect(
        searchMaid({ location: "NY", service: "cleaning", type: 1 })
      ).rejects.toThrow("Error searching maids: Database error");
    });
  });
  

  describe('createBooking', () => {
    it('should create a booking for type 1', async () => {
      const bookingData = { maidId: '1', slot: '10AM', type: 1, service: 'cleaning' };
      const userId = 'user123';
      const bookingObj = {
        id: 'booking1',
        maidId: '1',
        userId,
        slot: { Monday: '10AM', Wednesday: '10AM', Friday: '10AM' },
        paymentStatus: false,
        service: 'cleaning'
      };
      Booking.create.mockResolvedValue(bookingObj);

      const result = await createBooking(bookingData, userId);
      expect(Booking.create).toHaveBeenCalled();
      expect(result).toEqual(bookingObj);
    });
  });

  describe('bookingConfirm', () => {
    it('should confirm booking and update maid availability', async () => {
      const bookingObj = {
        id: 'b1',
        maidId: '1',
        slot: { Monday: '10AM' },
        update: jest.fn().mockResolvedValue(true),
        paymentStatus: false
      };
      Booking.findByPk.mockResolvedValue(bookingObj);
      const maidObj = {
        maidId: '1',
        timeAvailable: { Monday: ['9AM', '10AM', '11AM'] },
        changed: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      Maid.findByPk.mockResolvedValue(maidObj);

      const result = await bookingConfirm('b1');
      expect(bookingObj.update).toHaveBeenCalledWith({ paymentStatus: true });
      expect(maidObj.timeAvailable.Monday).toEqual(['9AM', '11AM']);
      expect(maidObj.changed).toHaveBeenCalledWith('timeAvailable', true);
      expect(maidObj.save).toHaveBeenCalled();
      expect(result).toEqual(bookingObj);
    });

    it('should throw an error if booking is not found', async () => {
      Booking.findByPk.mockResolvedValue(null);
      await expect(bookingConfirm('b1')).rejects.toThrow('Booking not found');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking and update maid availability', async () => {
      const bookingObj = {
        id: 'b1',
        maidId: '1',
        userId: 'user1',
        slot: { Monday: '10AM' },
        destroy: jest.fn().mockResolvedValue(true)
      };
      Booking.findByPk.mockResolvedValue(bookingObj);
      const maidObj = {
        maidId: '1',
        timeAvailable: { Monday: ['9AM'] },
        changed: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      Maid.findByPk.mockResolvedValue(maidObj);

      await cancelBooking('user1', { bookingId: 'b1' });
      // The canceled booking's slot should be pushed back to the maid's available time.
      expect(maidObj.timeAvailable.Monday).toContain('10AM');
      expect(maidObj.changed).toHaveBeenCalledWith('timeAvailable', true);
      expect(maidObj.save).toHaveBeenCalled();
      expect(bookingObj.destroy).toHaveBeenCalled();
    });

    it('should throw an error if booking is not found', async () => {
      Booking.findByPk.mockResolvedValue(null);
      await expect(cancelBooking('user1', { bookingId: 'b1' })).rejects.toThrow('Booking not found');
    });

    it('should throw an error if user is unauthorized', async () => {
      const bookingObj = { id: 'b1', maidId: '1', userId: 'otherUser', slot: { Monday: '10AM' } };
      Booking.findByPk.mockResolvedValue(bookingObj);
      await expect(cancelBooking('user1', { bookingId: 'b1' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getBookings', () => {
    it('should return all bookings for the user', async () => {
      const bookings = [{ id: 'b1' }, { id: 'b2' }];
      Booking.findAll.mockResolvedValue(bookings);

      const result = await getBookings('user1');
      expect(Booking.findAll).toHaveBeenCalledWith({ where: { userId: 'user1', paymentStatus: true } });
      expect(result).toEqual(bookings);
    });

    it('should throw an error when booking retrieval fails', async () => {
      Booking.findAll.mockRejectedValue(new Error('DB error'));
      await expect(getBookings('user1')).rejects.toThrow('Error fetching bookings: DB error');
    });
  });

  describe('getBookingsById', () => {
    it('should return a specific booking for the user', async () => {
      const bookingObj = { id: 'b1', userId: 'user1' };
      Booking.findByPk.mockResolvedValue(bookingObj);

      const result = await getBookingsById('user1', 'b1');
      expect(Booking.findByPk).toHaveBeenCalledWith('b1');
      expect(result).toEqual(bookingObj);
    });

    it('should throw an error if the user is not authorized', async () => {
      const bookingObj = { id: 'b1', userId: 'otherUser' };
      Booking.findByPk.mockResolvedValue(bookingObj);
      await expect(getBookingsById('user1', 'b1')).rejects.toThrow('Unauthorized');
    });

    it('should throw an error if booking retrieval fails', async () => {
      Booking.findByPk.mockRejectedValue(new Error('DB error'));
      await expect(getBookingsById('user1', 'b1')).rejects.toThrow('Error fetching booking: DB error');
    });
  });

});
