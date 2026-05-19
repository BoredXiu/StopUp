const regions = require("../data/regions.json");
const { success } = require("../utils/response");

const RegionController = {
	getAll(req, res) {
		const { province, city } = req.query;

		if (province && city) {
			const prov = regions.find((p) => p.name === province);
			if (!prov) return res.json(success([]));
			const c = prov.cities.find((c) => c.name === city);
			if (!c) return res.json(success([]));
			return res.json(success(c.districts));
		}

		if (province) {
			const prov = regions.find((p) => p.name === province);
			if (!prov) return res.json(success([]));
			return res.json(success(prov.cities.map((c) => ({ name: c.name }))));
		}

		const provinces = regions.map((p) => ({ name: p.name }));
		return res.json(success(provinces));
	},

	getFull(req, res) {
		return res.json(success(regions));
	},
};

module.exports = RegionController;