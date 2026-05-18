const Joi = require('joi');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return res.status(422).json({
        code: 422,
        message,
        data: null,
      });
    }
    req[source] = value;
    next();
  };
}

module.exports = { validate };