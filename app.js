const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const interestRouter = require('./routes/interestRoutes');
const commentRouter = require('./routes/commentRoutes');
const storeRouter = require('./routes/storeRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errController');

const app = express();

//1)GLOBAL Middle Wares
//Implement CORS
app.use(cors()); //-->Access-Control-Allow-Origin *
app.options('*', cors()); //-->HTTP method for preflight phase(del,update) to implement CORS

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//-----------------ROUTES--------------------
app.get('/', (req, res) => {
  res.send('This is my demo project');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/interests', interestRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/store', storeRouter);

app.all('*', (req, res, next) => {
  //-------------------Handleing Unhandled routes-------------------------------------
  next(new AppError(`Bad! route request!!.Can't find ${req.originalUrl}`, 404));
});

//--------------------GLOBAL ERROR HANDLER-----------
app.use(globalErrorHandler);

module.exports = app;
