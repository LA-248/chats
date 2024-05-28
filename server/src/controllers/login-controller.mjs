import crypto from 'crypto';
import { db } from '../services/database.mjs';

export default function authenticateUser(username, password, cb) {
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) { 
      return cb(err); 
    }
    if (!user) { 
      return cb(null, false, { message: 'Incorrect username or password.' }); 
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) { 
        return cb(err); 
      }

      const userHashedPasswordBuffer = Buffer.from(user.hashed_password, 'hex');
      if (!crypto.timingSafeEqual(userHashedPasswordBuffer, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, user);
    });
  });
}
