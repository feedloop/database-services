import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { hashPassword, generateApiKey } from '../utils/auth';
import { successResponse, errorResponse } from "../utils/response";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email is already registered.', 400);
    }

    const hashedPassword = await hashPassword(password);
    const apiKey = await generateApiKey();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      apikey: apiKey,
    });

    return successResponse(res, { id: newUser.id }, "User registered successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const signOptions: SignOptions = {
      expiresIn: ENV.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      ENV.JWT_SECRET,
      signOptions
    );

    return successResponse(res, { token }, "Login successful");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    return successResponse(res, user, "User details retrieved");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};