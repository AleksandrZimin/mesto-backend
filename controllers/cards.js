const cardSchema = require('../models/card');

const OK = 200;
const SUCCESS = 201;
const SERVER_ERROR = 500;
const VALIDATION_ERROR = 400;
const NOT_FOUND = 404;

module.exports.getCards = (req, res) => {
  cardSchema
    .find({})
    .then((users) => res.status(OK).send({ data: users }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
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
    .then((card) => res.status(SUCCESS).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
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
  const { cardId } = req.params.cardId;

  return cardSchema
    .findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(VALIDATION_ERROR).send({ message: 'Карточка не найдена' });
      }
      return res.status(OK).send({ data: card });
    }).catch((err) => res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` }));
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params.cardId;
  const userId = req.user._id;

  const card = cardSchema.findOne({ _id: cardId, likes: userId });

  if (card) {
    return res.status(OK).json({ message: 'Вы уже лайкнули эту карточку' });
  }
  return cardSchema
    .findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .then((r) => res.status(OK).send({ data: r }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).json({ message: 'Переданы некорректные данные' });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params.cardId;
  const userId = req.user._id;

  cardSchema.findOne({ _id: cardId, likes: userId }).then((card) => {
    if (!card) {
      return res.status(VALIDATION_ERROR).json({ message: 'Переданы некорректные данные' });
    }
    return cardSchema.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
      .then((updatedCard) => {
        if (!updatedCard) {
          return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка при обновлении карточки' });
        }
        return res.status(OK).send({ data: updatedCard });
      })
      .catch((err) => res.status(SERVER_ERROR).send({ message: `Произошла ошибка при обновлении карточки: ${err}` }));
  })
    .catch((err) => res.status(SERVER_ERROR).send({ message: `Произошла ошибка при поиске карточки: ${err}` }));
};
