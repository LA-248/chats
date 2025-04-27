import bcrypt from 'bcrypt';
import { User } from '../../models/user.model.ts';

async function authenticateUser(username, password, cb) {
  try {
    const user = await User.getUserByUsername(username);
    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }

    verifyPassword(password, user, cb);
  } catch (err) {
    return cb(err);
  }
}

function verifyPassword(password, user, cb) {
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

export { authenticateUser, verifyPassword };
