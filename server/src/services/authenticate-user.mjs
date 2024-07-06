import { getUserByUsername } from '../models/user-model.mjs';
import verifyPassword from './verify-password.mjs';

export default async function authenticateUser(username, password, cb) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }
    
    verifyPassword(password, user, cb);
  } catch (err) {
    return cb(err);
  }
}
