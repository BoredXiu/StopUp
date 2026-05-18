function success(data = null, message = 'success') {
  return {
    code: 200,
    message,
    data,
  };
}

function paginate(list, total, page, pageSize) {
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  };
}

function fail(message = '操作失败', code = 400) {
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