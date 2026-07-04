function successResponse(data, message) {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

function errorResponse(message, details) {
  const response = {
    success: false,
    message,
  };

  if (details) {
    response.details = details;
  }

  return response;
}

module.exports = {
  successResponse,
  errorResponse,
};
