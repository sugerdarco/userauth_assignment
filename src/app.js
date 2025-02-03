import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// import routes
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/users", userRouter);

// Error Handler Middleware must be the last middleware
app.use(errorHandler);

export default app;