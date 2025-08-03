import express from 'express';
import { ParcelController } from './parcel.controller';
import { checkAuth } from "../../middlewares/checkAuth"; // Placeholder for your auth middleware
import { Role } from "../user/user.interface"; // Placeholder for your user roles
import { validateRequest } from "../../middlewares/validateRequest"; // Placeholder for your validation middleware
import { ParcelValidation } from './parcel.validation';

const router = express.Router();

// A sender can create a new parcel delivery request.
router.post(
  '/create',
 //validateRequest(ParcelValidation.createParcelZodSchema),
  checkAuth(Role.SENDER), // Protected route for Senders only.
  ParcelController.createParcel,
);

// A sender or receiver can view their own parcels.
router.get(
  '/my-parcels',
  checkAuth(Role.SENDER, Role.RECEIVER), // Protected for both Senders and Receivers.
  ParcelController.getMyParcels,
);

// A sender or receiver can get a single parcel by ID.
// Admin can also use this route.
router.get(
  '/:id',
  checkAuth(Role.SENDER, Role.RECEIVER, Role.ADMIN), // Protected for all three roles.
  ParcelController.getSingleParcel,
);

// An admin can get all parcels in the system.
router.get(
  '/',
  checkAuth(Role.ADMIN), // Protected route for Admins only.
  ParcelController.getAllParcels,
);

// A sender can cancel a parcel.
router.patch(
  '/cancel/:id',
  checkAuth(Role.SENDER), // Protected for Senders only.
  ParcelController.cancelParcel,
);

// A receiver can confirm delivery of a parcel.
router.patch(
  '/confirm-delivery/:id',
  checkAuth(Role.RECEIVER), // Protected for Receivers only.
  ParcelController.confirmDelivery,
);

// An admin can update the status of any parcel.
router.patch(
  '/update-status/:id',
  //validateRequest(ParcelValidation.updateParcelStatusZodSchema),
  checkAuth(Role.ADMIN), // Protected for Admins only.
  ParcelController.updateParcelStatus,
);

// An admin can block a parcel.
router.patch(
  '/block-parcel/:id',
  checkAuth(Role.ADMIN), // Protected for Admins only.
  ParcelController.blockParcel,
);

export const ParcelRoutes = router;