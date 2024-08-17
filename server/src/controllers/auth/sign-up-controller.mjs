import bcrypt from 'bcrypt';
import { db } from '../../services/database.mjs';
import { User } from '../../models/user-model.mjs';

const handleSignUp = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await User.insertNewUser(username, hashedPassword);

    // Fetch the newly created user
    const newUser = await User.getUserByUsername(username);

    // Automatically log in the newly created user
    req.login(newUser, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Error logging in. Please try again.' });
      }
      return res.status(200).json({ redirectPath: '/' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export { handleSignUp };
