import crypto from 'crypto';
import { db } from '../../services/database.mjs';


const handleSignUp = (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).json({ message: 'An unexpected error occurred.' });
      console.error(err.message);
      return;
    }

    // Check if username already exists
    if (row) {
      res.status(409).json({ message: 'Username already taken'});
      return;
    }

    // Generate a salt
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) {
        res.status(500).json({ message: 'Error creating account. Please try again.' });
        console.error(err.message);
        return;
      }

      // Convert hashedPassword to hex string for database storage
      const hashedPasswordHex = hashedPassword.toString('hex');

      db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [username, hashedPasswordHex, salt], (err) => {
        if (err) {
          res.status(500).json({ message: 'An unexpected error occurred.' });
          console.error(err.message);
          return;
        }
      
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
          if (err) {
            res.status(500).json({ message: 'An unexpected error occurred.' });
            console.error(err.message);
            return;
          }

          // Automatically log in the newly created user
          req.login(user, (err) => {
            if (err) {
              console.error('Login error:', err.message);
              res.status(500).json({ message: 'Error logging in. Please try again.' });
              return;
            }

            res.status(200).json({ redirectPath: '/' });
            return;
          });
        });
      });
    });
  });
};

export { handleSignUp };
