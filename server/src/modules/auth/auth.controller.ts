import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await registerUser(parsed.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    const statusCode =
      message === "User with this email already exists" ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await loginUser(parsed.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    const statusCode =
      message === "Invalid email or password" ? 401 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    const statusCode = message === "User not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};