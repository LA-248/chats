import passport from 'passport';
import authenticateUser from '../controllers/login-controller.mjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from '../services/database.mjs';

export default function configurePassport() {
  passport.use(new LocalStrategy(authenticateUser));

  // Store user data in the session
  passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });
  
  // Retrieves the user data from the session and makes it available in the request object
  passport.deserializeUser(function (id, cb) {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      cb(err, user);
    });
  });
}
