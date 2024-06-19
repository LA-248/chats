export const retrieveUserId = async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    res.json({ userId: req.session.passport.user });
  } else {
    res.json({ errorMessage: 'User not authenticated' });
  }
};
