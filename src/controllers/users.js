const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const userSchema = require('../models/user');
// const Unauthorized = require('../../errors/Unauthorized');
const NotFound = require('../errors/NotFound');
const Success = require('../errors/Success');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');

module.exports.getUsers = (req, res, next) => {
  userSchema
    .find({})
    .then((users) => {
      if (!users) {
      // res.status(404).send('Пользователи не найдены')
        throw new NotFound('Пользователи не найдены');
      }
      return res.send({ data: users });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userID } = req.params;
  return userSchema
    .findById(userID)
    .then((user) => {
      if (user === null) {
        next(new NotFound('Запрашиваемый пользователь без данных'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Запрашиваемый пользователь не найден'));
      }
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequest(`Некорректный id пользователя ${userID}`));
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    next(new BadRequest('Email или пароль не могут быть пустыми'));
  }

  bcrypt.hash(password, 10)
    .then((hash) => userSchema.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({ user }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new Conflict('Пользователь с таким email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные при создании пользователя.'));
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema.findUserByCredentials(email, password).then((user) => {
    const payload = {
      _id: user._id,
    };

    const token = jwt.sign(payload, 'секретный_ключ', { expiresIn: '7d' });

    res.send({ token });
  }).catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  const userId = req.user._id;
  userSchema
    .findById(userId)
    .then((user) => {
      if (user) {
        res.send(user);
        return;
      }
      next(new NotFound('Пользователь по указанному id не найден'));
    })
    .catch((err) => next(err));
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  return userSchema
    .findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    )
    .then(() => res.send({ data: { name, about } }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Переданы некорректные данные'));
      }
      next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  return userSchema
    .findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then(() => next(new Success({ avatar })))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Переданы некорректные данные'));
      }
      return res.send({ avatar });
    });
};
