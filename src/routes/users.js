const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regExpUrl } = require('../utils/validators');

const {
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
  getUserById,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regExpUrl),
  }),
}), updateAvatar);
router.get('/:userID', celebrate({
  params: Joi.object().keys({
    userID: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

module.exports = router;
