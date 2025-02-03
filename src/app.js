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

// import routes
import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);

export default app;