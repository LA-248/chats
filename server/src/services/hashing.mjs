import crypto from 'crypto';

export default function hashPassword(password, user, cb) {
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
}
