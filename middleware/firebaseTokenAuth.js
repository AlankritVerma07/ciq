const jwtDecode = require('jwt-decode');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const myCache = require('../utils/nodeCache');

exports.protect = catchAsync(async (req, res, next) => {
  if (
    !(
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    )
  ) {
    return next(
      new AppError(
        `No Firebase ID token was passed as a Bearer token in the Authorization header.
    Make sure you authorize your request by providing the following HTTP header:,
    Authorization: Bearer <Firebase ID Token>`,
        403
      )
    );
  }
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    return next(new AppError('Unauthorized', 403));
  }
  const cacheUser = myCache.get(idToken);

  if (!cacheUser) {
    try {
      const decodeValue = jwtDecode(idToken);
      if (decodeValue && decodeValue.sub) {
        myCache.set(idToken, decodeValue, 3000);
        req.user = decodeValue;
        return next();
      }
    } catch {
      return next(new AppError('Error while verifying Firebase ID token', 403));
    }
  }

  req.user = cacheUser;
  next();
});
