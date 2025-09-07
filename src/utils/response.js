exports.handleResponse = (res, code, message, data) => {
  var response = {};
  if (data) {
    response = {
      code: code,
      message: message,
      data: data,
    };
  } else {
    response = {
      code: code,
      message: message,
      data: data,
    };
  }
  return res.status(code).json(response);
};