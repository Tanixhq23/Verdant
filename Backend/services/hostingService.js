const axios = require('axios');
const { greenWebAPI } = require('../config/config');

exports.checkGreenHosting = async (url) => {
  const domain = new URL(url).hostname;
  const { data } = await axios.get(`${greenWebAPI}${domain}`);
  return data.green;
};