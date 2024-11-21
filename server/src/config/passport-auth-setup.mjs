import passport from 'passport';
import authenticateUser from '../services/authenticate-user.mjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool } from '../../db/index.mjs';

export default function configurePassport() {
  passport.use(new LocalStrategy(authenticateUser));

  // Store user data in the session
  passport.serializeUser(function (user, cb) {
    cb(null, user.user_id);
  });

  // Retrieves the user data from the session and makes it available in the request object
  passport.deserializeUser(function (id, cb) {
    pool.query('SELECT * FROM users WHERE user_id = $1', [id], (err, result) => {
      cb(err, result.rows[0]);
    });
  });
}
