"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = __importDefault(require("express"));
const parcel_controller_1 = require("./parcel.controller");
const checkAuth_1 = require("../../middlewares/checkAuth"); // Placeholder for your auth middleware
const user_interface_1 = require("../user/user.interface"); // Placeholder for your user roles
const router = express_1.default.Router();
// A sender can create a new parcel delivery request.
router.post('/create', 
//validateRequest(ParcelValidation.createParcelZodSchema),
(0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), // Protected route for Senders only.
parcel_controller_1.ParcelController.createParcel);
// A sender or receiver can view their own parcels.
router.get('/my-parcels', (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER), // Protected for both Senders and Receivers.
parcel_controller_1.ParcelController.getMyParcels);
// A sender or receiver can get a single parcel by ID.
// Admin can also use this route.
router.get('/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER, user_interface_1.Role.ADMIN), // Protected for all three roles.
parcel_controller_1.ParcelController.getSingleParcel);
// An admin can get all parcels in the system.
router.get('/', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), // Protected route for Admins only.
parcel_controller_1.ParcelController.getAllParcels);
// A sender can cancel a parcel.
router.patch('/cancel/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), // Protected for Senders only.
parcel_controller_1.ParcelController.cancelParcel);
// A receiver can confirm delivery of a parcel.
router.patch('/confirm-delivery/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), // Protected for Receivers only.
parcel_controller_1.ParcelController.confirmDelivery);
// An admin can update the status of any parcel.
router.patch('/update-status/:id', 
//validateRequest(ParcelValidation.updateParcelStatusZodSchema),
(0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), // Protected for Admins only.
parcel_controller_1.ParcelController.updateParcelStatus);
// An admin can block a parcel.
router.patch('/block-parcel/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), // Protected for Admins only.
parcel_controller_1.ParcelController.blockParcel);
exports.ParcelRoutes = router;
