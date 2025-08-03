// src/modules/parcel/parcel.service.ts
import { Types } from 'mongoose';
import { Parcel } from './parcel.model';
import httpStatus from "http-status-codes";
import { IParcel, ITrackingEvent, ParcelStatus } from './parcel.interface';
import AppError from "../../errorHelpers/AppError";
// src/modules/parcel/parcel.service.ts
import { User } from '../user/user.model'; // Assuming you have a User model to fetch user details.

// Fee Calculation Constants
const BASE_RATE = 100; // Flat fee
const RATE_PER_KG = 50; // Cost per kilogram

// Helper function to calculate the fee
const calculateFee = (weight: number): number => {
  return BASE_RATE + (weight * RATE_PER_KG);
};

const createParcel = async (
  parcelData: Omit<IParcel, 'trackingId' | 'status' | 'trackingEvents' | 'isCanceled' | 'isBlocked' | 'isConfirmed' | 'senderInfo' | 'receiverInfo' | 'fee'>,
  senderId: Types.ObjectId,
): Promise<IParcel | null> => {
  // Check if the senderId from the request matches the senderId in the data.
  if (parcelData.senderId.toString() !== senderId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to create a parcel for another user.');
  }

  // Fetch sender and receiver details from the User model.
  const sender = await User.findById(parcelData.senderId);
  const receiver = await User.findById(parcelData.receiverId);

  if (!sender || !receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sender or Receiver not found!');
  }

  // Check if sender has required contact information
  if (!sender.phone || !sender.address) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sender must have a phone number and address in their profile to create a parcel.');
  }

  // Check if receiver has required contact information
  if (!receiver.phone || !receiver.address) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Receiver must have a phone number and address in their profile to receive a parcel.');
  }

  // Populate senderInfo and receiverInfo from the fetched user data.
  const senderInfo = {
    name: sender.name,
    address: sender.address,
    phone: sender.phone,
  };
  const receiverInfo = {
    name: receiver.name,
    address: receiver.address,
    phone: receiver.phone,
  };

  // Calculate the fee based on parcel weight
  const fee = calculateFee(parcelData.parcelDetails.weight);

  const initialTrackingEvent: ITrackingEvent = {
    status: 'requested',
    timestamp: new Date(),
    updatedBy: senderId,
    note: 'Parcel creation requested by sender.',
  };

  const result = await Parcel.create({
    ...parcelData,
    senderInfo,
    receiverInfo,
    fee, // Include the calculated fee in the parcel data
    status: 'requested',
    trackingEvents: [initialTrackingEvent],
  });

  return result;
};

// const createParcel = async (
//   parcelData: Omit<IParcel, 'trackingId' | 'status' | 'trackingEvents' | 'isCanceled' | 'isBlocked' | 'isConfirmed' | 'senderInfo' | 'receiverInfo'>,
//   senderId: Types.ObjectId,
// ): Promise<IParcel | null> => {
//   // Check if the senderId from the request matches the senderId in the data.
//   if (parcelData.senderId.toString() !== senderId.toString()) {
//     throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to create a parcel for another user.');
//   }

//   // Fetch sender and receiver details from the User model.
//   const sender = await User.findById(parcelData.senderId);
//   const receiver = await User.findById(parcelData.receiverId);

//   if (!sender || !receiver) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Sender or Receiver not found!');
//   }

//   // Check if sender has required contact information
//   if (!sender.phone || !sender.address) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Sender must have a phone number and address in their profile to create a parcel.');
//   }

//   // Check if receiver has required contact information
//   if (!receiver.phone || !receiver.address) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Receiver must have a phone number and address in their profile to receive a parcel.');
//   }

//   // Populate senderInfo and receiverInfo from the fetched user data.
//   const senderInfo = {
//     name: sender.name,
//     address: sender.address,
//     phone: sender.phone,
//   };
//   const receiverInfo = {
//     name: receiver.name,
//     address: receiver.address,
//     phone: receiver.phone,
//   };

//   const initialTrackingEvent: ITrackingEvent = {
//     status: 'requested',
//     timestamp: new Date(),
//     updatedBy: senderId,
//     note: 'Parcel creation requested by sender.',
//   };

//   const result = await Parcel.create({
//     ...parcelData,
//     senderInfo,
//     receiverInfo,
//     status: 'requested',
//     trackingEvents: [initialTrackingEvent],
//   });

//   return result;
// };



// Function to get filtered parcels for the authenticated user myparcels.
const getMyParcels = async (userId: Types.ObjectId, filters: any): Promise<any[]> => {
  const query: any = {
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  };

  // Add filters if they exist
  if (filters.status) {
    query.status = filters.status;
  }

  // Add date range filtering
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  const parcels = await Parcel.find(query).lean();
  return parcels;
};

const getSingleParcel = async (parcelId: string, queryOptions: { userId?: Types.ObjectId }): Promise<any> => {
  // Build the query dynamically based on the queryOptions
  const query: any = { _id: parcelId };

  // If a userId is provided, restrict the search to parcels where the user is either the sender or receiver
  if (queryOptions.userId) {
    query.$or = [{ senderId: queryOptions.userId }, { receiverId: queryOptions.userId }];
  }

  const result = await Parcel.findOne(query);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found or you are not authorized to view it.');
  }

  return result;
};

// Function to get all parcels for an Admin.
const getAllParcelsForAdmin = async (): Promise<IParcel[]> => {
  const result = await Parcel.find({}).populate('senderId receiverId');
  return result;
};

// Function for a sender to cancel a parcel.
const cancelParcel = async (parcelId: string, senderId: Types.ObjectId): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found!');
  }
  
  // Check if the authenticated user is the sender.
  if (parcel.senderId.toString() !== senderId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to cancel this parcel.');
  }

  // A parcel can only be canceled if its status is 'requested' or 'pending'.
  if (parcel.status === 'in_transit' || parcel.status === 'delivered') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot cancel a parcel that is already in transit or delivered.');
  }
  
  // Update the parcel status and add a new tracking event.
  parcel.status = 'canceled';
  parcel.isCanceled = true;
  
  const newTrackingEvent: ITrackingEvent = {
    status: 'canceled',
    timestamp: new Date(),
    updatedBy: senderId,
    note: 'Parcel canceled by sender.',
  };
  parcel.trackingEvents.push(newTrackingEvent);

  const result = await parcel.save();
  return result;
};

// Function for a receiver to confirm delivery.
const confirmDelivery = async (parcelId: string, receiverId: Types.ObjectId): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found!');
  }

  // Check if the authenticated user is the receiver.
  if (parcel.receiverId.toString() !== receiverId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to confirm this parcel.');
  }

  // A parcel can only be confirmed if its status is 'in_transit' or 'delivered'.
  if (parcel.status !== 'in_transit') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot confirm delivery for a parcel that is not in transit.');
  }

  // Update the parcel status and add a new tracking event.
  parcel.status = 'delivered';
  parcel.isConfirmed = true;

  const newTrackingEvent: ITrackingEvent = {
    status: 'delivered',
    timestamp: new Date(),
    updatedBy: receiverId,
    note: 'Delivery confirmed by receiver.',
  };
  parcel.trackingEvents.push(newTrackingEvent);

  const result = await parcel.save();
  return result;
};

// Function for an Admin to update a parcel's status.
const updateParcelStatus = async (
  parcelId: string,
  newStatus: ParcelStatus,
  adminId: Types.ObjectId,
  note?: string,
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found!');
  }

  // Update the parcel's status.
  parcel.status = newStatus;

  // Add a new tracking event.
  const newTrackingEvent: ITrackingEvent = {
    status: newStatus,
    timestamp: new Date(),
    updatedBy: adminId,
    note: note || `Status updated to '${newStatus}' by Admin.`,
  };
  parcel.trackingEvents.push(newTrackingEvent);

  const result = await parcel.save();
  return result;
};

// Function for an Admin to block a parcel.
const blockParcel = async (parcelId: string, adminId: Types.ObjectId): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found!');
  }
  
  if (parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Parcel is already blocked.');
  }

  parcel.isBlocked = true;
  parcel.status = 'blocked';

  const newTrackingEvent: ITrackingEvent = {
    status: 'blocked',
    timestamp: new Date(),
    updatedBy: adminId,
    note: 'Parcel blocked by Admin.',
  };
  parcel.trackingEvents.push(newTrackingEvent);
  
  const result = await parcel.save();
  return result;
};

export const ParcelService = {
  createParcel,
  getMyParcels,
  getSingleParcel,
  getAllParcelsForAdmin,
  cancelParcel,
  confirmDelivery,
  updateParcelStatus,
  blockParcel,
};


