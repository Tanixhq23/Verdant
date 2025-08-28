// config/config.js
// require('dotenv').config(); // REMOVE THIS LINE

module.exports = {
  port: process.env.PORT || 3000,
  greenWebAPI: process.env.GREENWEB_API,
  mongoURI: process.env.MONGODB_URI // This will now correctly pull from process.env
};