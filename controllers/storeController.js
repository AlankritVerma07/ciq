const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const Store = require('../models/storeModel');

// get available stores on inrdeals (still using inrdeals api for this)
exports.getStore = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 30;

  const apiData = await fetch(
    `https://inrdeals.com/fetch/stores?token=${process.env.Update_Token_Store}&id=${process.env.Ciquence_id}&subid=${req.currentUser._id}`
  );

  const finalData = await apiData.json();

  //filter on bases of status : acitve
  const filterdData = finalData.stores.filter((el) => el.status === 'active');

  // Pagination using slice
  const data = filterdData.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    status: true,
    data,
  });
});

// old way of searching through api call to inrdeals (takes time)

// exports.searchStore = catchAsync(async (req, res, next) => {
//   const apiData = await fetch(
//     `https://inrdeals.com/api/v1/coupon-feed?token=${process.env.Cupons_API_Token}&id=${process.env.Ciquence_id}&search=${req.query.text}`
//   );

//   const finalData = await apiData.json();
//   /*eslint-disable-next-line*/
//   const data = finalData.data;

//   data.forEach((el) => {
//     const defaultTrackingLink = new URL(el.url);
//     defaultTrackingLink.searchParams.set('subid', req.currentUser._id);
//     el.url = defaultTrackingLink.toString();
//   });

//   res.status(200).json({
//     status: true,
//     data,
//   });
// });

// Search with merchant and category (very fast)
exports.searchStore = catchAsync(async (req, res, next) => {
  if (!req.query.search) {
    return res.status(200).json({
      status: false,
      message: 'The search cannot be empty',
    });
  }

  const regex = new RegExp(req.query.search, 'i');
  const dbData = await Store.find({
    $or: [
      {
        merchant: regex,
      },
      {
        category: regex,
      },
    ],
  });

  dbData.forEach((el) => {
    const defaultTrackingLink = new URL(el.url);
    defaultTrackingLink.searchParams.set('subid', req.currentUser._id);
    el.url = defaultTrackingLink.toString();
  });

  //filter on bases of status : acitve
  const data = dbData.filter((el) => el.status === 'active');

  res.status(200).json({
    status: true,
    data,
  });
});

exports.updateStores = async (req, res, next) => {
  const response = await Store.deleteMany({});
  let data = [];
  if (response.acknowledged === true) {
    const storeData = await fetch(
      `https://inrdeals.com/fetch/stores?token=${process.env.Update_Token_Store}&id=${process.env.Ciquence_id}`
    );
    const apiResponseData = await storeData.json();
    data = await Store.insertMany(apiResponseData.stores);
  } else {
    res.status(200).json({
      status: false,
      message: 'Previous data was not deleted in Database',
    });
  }

  res.status(200).json({
    status: true,
    data,
  });
};
