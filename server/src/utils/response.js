function toCamel(str) {
	return str.replace(/_([a-z])/g, function (_, c) {
		return c.toUpperCase();
	});
}

function camelizeKeys(obj) {
	if (Array.isArray(obj)) return obj.map(camelizeKeys);
	if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
		var result = {};
		var keys = Object.keys(obj);
		for (var i = 0; i < keys.length; i++) {
			result[toCamel(keys[i])] = camelizeKeys(obj[keys[i]]);
		}
		return result;
	}
	return obj;
}

function success(data = null, message = "success") {
	return {
		code: 200,
		message,
		data: camelizeKeys(data),
	};
}

function paginate(list, total, page, pageSize) {
	return {
		code: 200,
		message: "success",
		data: {
			list: camelizeKeys(list),
			pagination: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		},
	};
}

function fail(message = "操作失败", code = 400) {
	return {
		code,
		message,
		data: null,
	};
}

module.exports = {
	success,
	paginate,
	fail,
};
