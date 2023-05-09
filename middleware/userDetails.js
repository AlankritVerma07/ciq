const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.currentUser = catchAsync(async (req, res, next) => {
  const firebaseId = req.user.user_id;

  if (!firebaseId) {
    return next(
      new AppError('the User belonging to this token does not exist', 401)
    );
  }
  const user = await User.findOne({ firebaseId });
  req.currentUser = user;
  return next();
});
