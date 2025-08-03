"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const routes_1 = require("./routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("./config/env");
require("./config/passport");
const app = (0, express_1.default)();
// 1. Correctly place and use express.json() once at the top.
app.use(express_1.default.json());
// 2. Add other middleware functions.
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// 3. Define all your API routes.
app.use("/api/v1", routes_1.router);
// 4. Define your root endpoint.
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Parcel Delivery System Backend API"
    });
});
// 5. Place error-handling middleware at the very end.
// notFound handles 404 errors for any routes that don't match.
app.use(notFound_1.default);
// globalErrorHandler catches all other errors, including Zod errors.
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
