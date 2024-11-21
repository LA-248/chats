import passport from 'passport';

export const handleUserLogin = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Incorrect username or password' });
    }

    if (err) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal server error' });
    }

    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({
            success: false,
            error: 'Error logging in. Please try again.',
          });
      }
      // Redirect URL is included so the frontend can redirect the user after a successful log in
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        redirectPath: '/',
      });
    });
  })(req, res, next);
};
