const SportModel = require('../models/Sport');
const { success } = require('../utils/response');

const SportController = {
  async getAll(req, res) {
    const sports = await SportModel.getAll();
    res.json(success(sports));
  },
};

module.exports = SportController;