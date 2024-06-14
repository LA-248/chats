import { getUserByUsername } from '../models/user-model.mjs';
import hashPassword from './hashing.mjs';

export default async function authenticateUser(username, password, cb) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    
    hashPassword(password, user, cb);
  } catch (err) {
    return cb(err);
  }
}
