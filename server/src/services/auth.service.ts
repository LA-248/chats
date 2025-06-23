/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.ts';
import { User as UserInfo } from '../schemas/user.schema.ts';

async function authenticateUser(
  username: string,
  password: string,
  cb: (err: any, user?: UserInfo | false, info?: { message: string }) => void
) {
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

function verifyPassword(
  password: string,
  user: UserInfo,
  cb: (err: any, user?: User | false, info?: { message: string }) => void
) {
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
