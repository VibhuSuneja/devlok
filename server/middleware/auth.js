import { createClerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised — no token' });
    }
    const token = authHeader.split(' ')[1];
    
    // Verify the Clerk token
    const decoded = await clerkClient.verifyToken(token);
    const clerkId = decoded.sub;

    // Find user by clerkId, fallback to email if we previously migrated
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Lazy migration: if no clerkId, try to find by email and link it
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await User.findOne({ email });
      
      if (user) {
        user.clerkId = clerkId;
        // Sync role if present in Clerk metadata
        if (clerkUser.publicMetadata?.role) {
          user.role = clerkUser.publicMetadata.role;
        }
        await user.save();
      } else {
        // Option 1: Create user on the fly
        user = await User.create({
          clerkId,
          email,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'Eternal Soul',
          role: clerkUser.publicMetadata?.role || 'user',
          gurukul: clerkUser.publicMetadata?.gurukul || false
        });
      }
    } else {
      // Sync logic for existing users: periodically or every request check metadata
      // For now, let's just make sure req.user is populated.
      // Optimization: we could decode the token and check metadata directly if it's there
      if (decoded.role && user.role !== decoded.role) {
        user.role = decoded.role;
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  
  // High-level fallback for development
  if (req.user && req.user.email === 'admin@devlok.com') return next();

  res.status(403).json({ message: 'Admin access required' });
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = await clerkClient.verifyToken(token);
      const clerkId = decoded.sub;
      
      let user = await User.findOne({ clerkId });
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0].emailAddress;
        user = await User.findOne({ email });
        if (user) {
          user.clerkId = clerkId;
          await user.save();
        } else {
           user = await User.create({
            clerkId,
            email,
            name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'Eternal Soul',
            role: clerkUser.publicMetadata?.role || 'user',
            gurukul: clerkUser.publicMetadata?.gurukul || false
          });
        }
      }
      req.user = user;
    }
  } catch (err) {
    // Ignore errors for optional auth
  }
  next();
};

/**
 * Synchronizes local user state to Clerk publicMetadata
 * @param {Object} user - Local Mongoose user document
 */
export const syncUserToClerk = async (user) => {
  if (!user.clerkId) return;
  
  try {
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: user.role,
        gurukul: user.gurukul,
        shraddha: user.shraddha,
        conceptsRead: user.conceptsRead || [],
      }
    });
  } catch (err) {
    console.error('Clerk Sync Failed:', err);
  }
};

