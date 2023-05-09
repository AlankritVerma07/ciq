const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  //console.log(con.connections);
  console.log('db connection success!!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on ${port}`);
});
