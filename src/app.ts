import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import passport from "passport";
import { envVars } from "./config/env";
import "./config/passport";

const app = express()

// 1. Correctly place and use express.json() once at the top.
app.use(express.json());

// 2. Add other middleware functions.
app.use(cors());
app.use(cookieParser());
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// 3. Define all your API routes.
app.use("/api/v1", router)

// 4. Define your root endpoint.
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Parcel Delivery System Backend API"
    })
})

// 5. Place error-handling middleware at the very end.
// notFound handles 404 errors for any routes that don't match.
app.use(notFound)
// globalErrorHandler catches all other errors, including Zod errors.
app.use(globalErrorHandler)

export default app