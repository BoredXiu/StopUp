const VenueModel = require('../models/Venue');
const { success, paginate } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const VenueController = {
  async list(req, res) {
    const { page = 1, pageSize = 20, city, district, isHot, keyword, orderBy, orderDir } = req.query;
    const result = await VenueModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      city,
      district,
      isHot: isHot !== undefined ? parseInt(isHot) : undefined,
      keyword,
      orderBy,
      orderDir,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async detail(req, res) {
    const id = parseInt(req.params.id);
    const venue = await VenueModel.findById(id);
    if (!venue) throw new NotFoundError('场馆不存在');
    res.json(success(venue));
  },

  async getHot(req, res) {
    const { limit = 6 } = req.query;
    const venues = await VenueModel.getHot(parseInt(limit));
    res.json(success(venues));
  },
};

module.exports = VenueController;