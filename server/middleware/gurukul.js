import User from '../models/User.js';

// Must be used AFTER the `protect` middleware
export const requireGurukul = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised — no user found.' });
    }

    // Admins bypass the gate automatically
    if (req.user.role === 'admin') {
      return next();
    }

    // Shraddha Lock Enforcement
    if (req.user.gurukul !== true) {
      return res.status(403).json({ 
        message: 'A deeper state of Shraddha is required. Please join the Gurukul to access this sacred knowledge.',
        requiresPayment: true 
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error verifying access level.' });
  }
};
