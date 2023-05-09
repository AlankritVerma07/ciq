const admin = require('../config/firebase-config');

exports.protect = async (req, res, next) => {
  if (
    !(
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    )
  ) {
    return res.status(403).json({
      status: 'Unauthorized',
      message: `No Firebase ID token was passed as a Bearer token in the Authorization header.
            Make sure you authorize your request by providing the following HTTP header:,
            Authorization: Bearer <Firebase ID Token>`,
    });
  }
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodeValue = await admin.auth().verifyIdToken(idToken);
      if (decodeValue) {
        req.user = decodeValue;
        return next();
      }
      return res.status(403).json({
        status: 'Unauthorized',
        message: 'Invalid Firebase ID token',
      });
    } catch (err) {
      return res.json({ message: err });
    }
  }
};
