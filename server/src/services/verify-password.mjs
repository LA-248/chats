import bcrypt from 'bcrypt';

export default function verifyPassword(password, user, cb) {
  bcrypt.compare(password, user.hashed_password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    if (!isMatch) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }
    
    return cb(null, user);
  });
}
