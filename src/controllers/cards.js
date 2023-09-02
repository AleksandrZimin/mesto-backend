const { default: mongoose } = require('mongoose');
const cardSchema = require('../models/card');

const OK = 200;
const SUCCESS = 201;
const SERVER_ERROR = 500;
const VALIDATION_ERROR = 400;
const NOT_FOUND = 404;

module.exports.getCards = (req, res) => {
  cardSchema
    .find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(OK).send({ data: cards }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res
          .status(VALIDATION_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      } if (err.name === 'ERR_ABORTED') {
        return res.status(NOT_FOUND).send({ message: 'Карточки не найдены' });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.createCard = (req, res) => {
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
        .then(() => {
          res.status(SUCCESS).send({ data: card });
        });
    })
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

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  return cardSchema
    .findByIdAndDelete(cardId)
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(OK).send({ data: card });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(VALIDATION_ERROR).send({ message: `Некорректный id: ${cardId}` });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.likeCard = (req, res) => {
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
        return res
          .status(NOT_FOUND)
          .send({ message: 'Запрашиваемой карточки нет в базе данных' });
      }
      return res.status(OK).send({ data: card });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(VALIDATION_ERROR).send({ message: `Некорректный id: ${cardId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(NOT_FOUND).send({ message: `Карточки с таким id нет: ${cardId}` });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err.name}` });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  cardSchema.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .populate(['owner', 'likes'])
    .then((updatedCard) => {
      if (!updatedCard) {
        return res.status(NOT_FOUND).send({ message: 'Карточки не существует в базе данных' });
      }
      return res.status(OK).send({ data: updatedCard });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(VALIDATION_ERROR).send({ message: `Некорректный id: ${cardId}` });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка при поиске карточки: ${err}` });
    });
};
