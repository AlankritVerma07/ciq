/* eslint-disable*/
const Interests = require('../models/interestModel');
const User = require('../models/userModel');

exports.getInterests = async (req, res, next) => {
  const allInterests = await Interests.find({}, 'Main');

  const newArray = [];
  const uniqueObject = {};
  for (let i in allInterests) {
    let objTitle = allInterests[i]['Main'];
    uniqueObject[objTitle] = allInterests[i];
  }
  for (i in uniqueObject) {
    newArray.push(uniqueObject[i]);
  }
  res.json({ status: true, data: newArray.splice(0, 49) });
};

exports.updateInterests = async (req, res, next) => {
  console.log(req.body);
  const user = await User.findByIdAndUpdate(
    req.currentUser._id,
    { interests: req.body.interests },
    {
      new: true,
      runValidators: false,
    }
  );

  if (!user) {
    return res.status(200).json({
      status: false,
      message: 'No user found with that ID',
    });
  }
  res.status(200).json({
    success: true,
    message: `User's interests updated successfully`,
    data: user,
  });
};
