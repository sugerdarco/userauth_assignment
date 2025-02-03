import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            error: err.error,
            data: err.data
        });
    }

    // Handle other types of errors
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
}; 