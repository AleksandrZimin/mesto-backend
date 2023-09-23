const { default: mongoose } = require('mongoose');
const cardSchema = require('../models/card');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

module.exports.getCards = (req, res, next) => {
  cardSchema
    .find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Переданы некорректные данные'));
      } if (err.name === 'ERR_ABORTED') {
        return next(new NotFound('Карточки не найдены'));
      }
      return next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  const createdAt = Date.now();

  return cardSchema
    .create({
      name,
      link,
      owner,
      likes: [],
      createdAt,
    })
    .then((card) => {
      card.populate(['owner'])
        .then(() => res.status(201).send({ data: card }));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Неверные данные'));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  cardSchema.findById(cardId)
    .then((card) => {
      if (!card) return next(new NotFound('Данные по указанному id не найдены'));
      if (`${card.owner}` !== req.user._id) {
        return next(new Forbidden('Доступ запрещен'));
      }
      return card
        .deleteOne()
        .then(() => res.send({ data: card }))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest('Неверные параметры запроса'));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  cardSchema
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFound('Запрашиваемой карточки нет в базе данных');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest(`Некорректный id: ${cardId}`));
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFound(`Карточки с таким id нет: ${cardId}`));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  cardSchema.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .populate(['owner', 'likes'])
    .then((updatedCard) => {
      if (!updatedCard) {
        throw new NotFound('Карточки не существует в базе данных');
      }
      return res.send({ data: updatedCard });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest(`Некорректный id: ${cardId}`));
      }
      return next(err);
    });
};
