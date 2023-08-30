const mongoose = require('mongoose');
const userSchema = require('../models/user');

const OK = 200;
const SERVER_ERROR = 500;
const VALIDATION_ERROR = 400;
const NOT_FOUND = 404;

module.exports.getUsers = (req, res) => userSchema.find({})
  .then((users) => {
    if (!users) {
      return res
        .status(NOT_FOUND)
        .send({ message: 'Пользователи не найдены' });
    }
    return res.status(OK).send({ data: users });
  })
  .catch((err) => res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` }));

module.exports.getUser = (req, res) => {
  const { userID } = req.params;
  return userSchema
    .findById(userID)
    .then((user) => {
      if (user === null) {
        return res
          .status(VALIDATION_ERROR)
          .send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(OK).send(user);
    })
    .catch(() => res.status(VALIDATION_ERROR).send({ message: 'Запрашиваемый пользователь не найден' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return userSchema
    .create({ name, about, avatar })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res
          .status(VALIDATION_ERROR)
          .send({ message: 'Неверные данные' });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  return userSchema
    .findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(VALIDATION_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  return userSchema
    .findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((r) => res.status(OK).send(r))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(VALIDATION_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: `Произошла ошибка на сервере ${err}` });
    });
};
