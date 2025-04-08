export const checkAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ authenticated: true });
  } else {
    return res.status(200).json({ authenticated: false });
  }
};
