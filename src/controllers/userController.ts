import { Request, Response, RequestHandler } from 'express';
import User from '../models/user';
// import { hashPassword, generateApiKey } from '../utils/auth';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey'; // Pastikan ada JWT_SECRET di .env

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate apikey
    const apikey = uuidv4();

    // Buat user baru
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      apikey,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error(error);  // Log error ke console
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
  try {
      const { email, password } = req.body;

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(401).json({ message: 'Email atau password salah.' });
      }

      // Bandingkan password yang diinput dengan password yang tersimpan
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Email atau password salah.' });
      }

      // Buat token JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

      res.status(200).json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get User Details (Protected)
export const getUserDetails = async (req: Request, res: Response) => {
  try {
      const token = req.headers.authorization?.split(' ')[1]; // Ambil token dari header
      if (!token) {
          return res.status(401).json({ message: 'Token tidak ditemukan.' });
      }

      // Verifikasi token
      const decoded: any = jwt.verify(token, SECRET_KEY);
      const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password'] } // Supaya password tidak ditampilkan
      });

      if (!user) {
          return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};