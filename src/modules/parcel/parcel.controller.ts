// src/modules/parcel/parcel.controller.ts

import { NextFunction, Request, Response } from 'express';
import { ParcelService } from './parcel.service';
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import AppError from "../../errorHelpers/AppError"
import { Role } from '../user/user.interface'; // Import the Role enum

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user as any; // Assuming req.user is populated by auth middleware
  const parcelData = req.body;

  // We enforce that only a sender can create a parcel.
  if (role !== 'SENDER') {
    throw new AppError(httpStatus.FORBIDDEN, 'Only senders can create parcels.');
  }

  const result = await ParcelService.createParcel(parcelData, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel created successfully!',
    data: result,
  });
});

const getMyParcels = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const filterOptions = req.query; // e.g., { status: 'delivered', deliveryTime: '2025-08-01' }

  const result = await ParcelService.getMyParcels(userId, filterOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My parcels retrieved successfully.',
    data: result,
  });
});
const getSingleParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { role, userId } = req.user as any;
  const { id } = req.params;

  // Determine the query parameters to pass to the service
  let queryOptions = {};

  if (role === Role.SENDER || role === Role.RECEIVER) {
    // For non-admin users, restrict the query by their user ID
    queryOptions = { userId: userId };
  } else if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
    // Admins can see any parcel, so no user ID is needed in the query.
    queryOptions = {};
  } else {
    // Handle other roles or unauthorized access
    // This is a good place to throw a 403 Forbidden error
    // For now, we'll let the service handle it based on null queryOptions.
  }

  const result = await ParcelService.getSingleParcel(id, queryOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel retrieved successfully!',
    data: result,
  });
});

const getAllParcels = catchAsync(async (req: Request, res: Response) => {
  const result = await ParcelService.getAllParcelsForAdmin();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All parcels retrieved successfully!',
    data: result,
  });
});

const cancelParcel = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const { id } = req.params;

  const result = await ParcelService.cancelParcel(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel canceled successfully!',
    data: result,
  });
});

const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const { id } = req.params;

  const result = await ParcelService.confirmDelivery(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delivery confirmed successfully!',
    data: result,
  });
});

const updateParcelStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const { id } = req.params;
  const { status, note } = req.body;

  const result = await ParcelService.updateParcelStatus(id, status, userId, note);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel status updated successfully!',
    data: result,
  });
});

const blockParcel = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const { id } = req.params;

  const result = await ParcelService.blockParcel(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel blocked successfully!',
    data: result,
  });
});

export const ParcelController = {
  createParcel,
  getMyParcels,
  getSingleParcel,
  getAllParcels,
  cancelParcel,
  confirmDelivery,
  updateParcelStatus,
  blockParcel,
};