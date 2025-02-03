import cors from 'cors';
import express from 'express';
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// import routes
import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);

export default app;