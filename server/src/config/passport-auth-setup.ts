import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool } from '../../db/index.ts';
import { authenticateUser } from '../services/auth.service.ts';
import { UserProfile } from '../types/user.js';

export default function configurePassport() {
  passport.use(new LocalStrategy(authenticateUser));

  // Store user data in the session
  passport.serializeUser(function (user: UserProfile, cb) {
    cb(null, user.user_id);
  });

  // Retrieves the user data from the session and makes it available in the request object
  passport.deserializeUser(function (id, cb) {
    pool.query(
      'SELECT user_id, username, profile_picture FROM users WHERE user_id = $1',
      [id],
      (err, result) => {
        cb(err, result.rows[0]);
      }
    );
  });
}
