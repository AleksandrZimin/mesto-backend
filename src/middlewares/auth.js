const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  // проверяем заголовок
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new Unauthorized('Необходима авторизация'));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  // проверяем токен
  try {
    payload = jwt.verify(token, 'секретный_ключ');
  } catch (err) {
    next(new Unauthorized('Необходима авторизация'));
    return;
  }
  // все хорошо идем дальше
  req.user = payload;
  next();
};
