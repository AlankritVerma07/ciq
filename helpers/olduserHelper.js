const User = require('../models/userModel');

exports.followUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.status(200).json({
        status: false,
        user,
        message: 'User does not exist',
      });
    }

    const index = user.following.indexOf(req.query.id);

    if (index === -1) {
      user.following.unshift(req.query.id);
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: true,
        message: 'User followed successfully',
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'You are already following this user.',
      });
    }
  } catch (err) {
    res.status(200).json({
      status: true,
      message: err.message,
    });
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    const index = user.following.indexOf(req.query.id);

    if (index !== -1) {
      user.following.splice(index, 1);
      await user.save();
      res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User not found',
      });
    }
  } catch (err) {
    res.status(200).json({
      success: true,
      message: err.message,
    });
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.status(200).json({
        status: false,
        user,
        message: 'User does not exist',
      });
    }

    const index = user.blocked.indexOf(req.query.id);

    if (index === -1) {
      user.blocked.unshift(req.query.id);
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: true,
        message: 'User blocked successfully',
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'You have already blocked this user.',
      });
    }
  } catch (err) {
    res.status(200).json({
      status: true,
      message: err.message,
    });
  }
};

exports.unBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    const index = user.blocked.indexOf(req.query.id);

    if (index !== -1) {
      user.blocked.splice(index, 1);
      await user.save();
      res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User not found',
      });
    }
  } catch (err) {
    res.status(200).json({
      success: true,
      message: err.message,
    });
  }
};

exports.muteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.status(200).json({
        status: false,
        user,
        message: 'User does not exist',
      });
    }

    const index = user.muted.indexOf(req.query.id);

    if (index === -1) {
      user.muted.unshift(req.query.id);
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: true,
        message: 'User muted successfully',
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'You have already muted this user.',
      });
    }
  } catch (err) {
    res.status(200).json({
      status: true,
      message: err.message,
    });
  }
};

exports.unMuteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    const index = user.muted.indexOf(req.query.id);

    if (index !== -1) {
      user.muted.splice(index, 1);
      await user.save();
      res.status(200).json({
        success: true,
        message: 'User unmuted successfully',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User not found',
      });
    }
  } catch (err) {
    res.status(200).json({
      success: true,
      message: err.message,
    });
  }
};

exports.following = async (req, res, next) => {
  try {
    const { following } = await User.findById(req.currentUser._id).populate({
      path: 'following',
      select: 'userName , fName , lName , userImage',
    });
    res.status(200).json({
      status: 'success',
      following,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//---------------------------------------------Above is Anmol's Code---------------------------

/**
 * @route /api/v1/users/similar-interests?id=xxxxx
 */

exports.similarInterests = async (req, res, next) => {
  try {
    // const pinCode = '670303';
    const { interests } = await User.findOne({ _id: req.params.id });
    // let users = [];
    // for (let i = 0; i < interests.length; i++) {
    //   const user = await User.find({ interests: { $all: [interests[i]] } });
    //   for (let j = 0; j < user.length; j++) {
    //     users.push(user[j]);
    //   }
    // }
    const users = await User.find({
      interests: { $in: interests },
    });

    // function getCoordinates(address) {
    //   fetch(
    //     `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${'AIzaSyAbGneGU8AmMXZBd4MhBvcXgXU0uwgumfw'}`
    //   )
    //     .then((response) => response.json())

    //     .then((data) => {
    //       console.log(data)
    //       const latitude = data.results.geometry.location.lat;
    //       const longitude = data.results.geometry.location.lng;
    //       console.log({ latitude, longitude });
    //     });
    // }
    // getCoordinates(pinCode);

    res.json({
      status: true,
      data: users,
    });
  } catch (err) {
    console.log(err);
  }
};
