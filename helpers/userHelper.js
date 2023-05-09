const User = require('../models/userModel');

/**
 * type ->followers, following , blocked , muted (type will only be these values nothing else)
 * @route /api/v1/users/addAction?id=62f361aa24c69b9a1e53c7c9&type=following
 */

exports.addAction = async (req, res, next) => {
  const { type } = req.query;
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.status(200).json({
        status: false,
        user,
        message: 'User does not exist',
      });
    }

    const index = user[`${type}`].indexOf(req.query.id);

    if (index === -1) {
      user[`${type}`].unshift(req.query.id);
      await user.save({ validateBeforeSave: false });
      // find user being followed and push the id in him also
      if (type === 'following') {
        const followingUser = await User.findById(req.query.id);
        followingUser.followers.unshift(req.currentUser._id);
        followingUser.save({ validateBeforeSave: false });
      }

      res.status(200).json({
        status: true,
        message: `User ${type} successfull`,
      });
    } else {
      res.status(200).json({
        status: true,
        message: `Already ${type} this user.`,
      });
    }
  } catch (err) {
    res.status(200).json({
      status: true,
      message: err.message,
    });
  }
};

/**
 * type ->followers,  following , blocked , muted (type will only be these values nothing else)
 * @route /api/v1/users/removAction?id=62f361aa24c69b9a1e53c7c9&type=following
 */

exports.removeAction = async (req, res, next) => {
  const { type } = req.query;
  try {
    const user = await User.findById(req.currentUser._id);
    const index = user[`${type}`].indexOf(req.query.id);

    if (index !== -1) {
      user[`${type}`].splice(index, 1);
      await user.save();
      res.status(200).json({
        success: true,
        message: `User un${type} successfull`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `User not found in the ${type} list.`,
      });
    }
  } catch (err) {
    res.status(200).json({
      success: true,
      message: err.message,
    });
  }
};

/**
 * type ->followers,  following , blocked , muted (type will only be these values nothing else)
 * @route /api/v1/users/networkList?type=following
 */

exports.list = async (req, res, next) => {
  try {
    const { type } = req.query;
    const response = await User.findById(req.currentUser._id).populate({
      path: `${type}`,
      select: 'userName , fName , lName , userImage',
    });
    const data = response[`${type}`];
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
