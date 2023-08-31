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
  const { cardId } = req.params;

  return cardSchema
    .findByIdAndRemove(cardId)
    .then((card) => {
      if (!cardId) {
        return res.status(NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(OK).send({ data: card });
    }).catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(NOT_FOUND).send({ message: `Некорректный id: ${cardId}` });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере ${err}` });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  // const userId = req.user._id
  cardSchema
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((r) => res.status(OK).send({ data: `Лайк поставлен: ${r}` }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(NOT_FOUND).send({ message: `Некорректный id: ${cardId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(NOT_FOUND).send({ message: `Карточки с таким id нет: ${cardId}` });
      }
      return res.status(SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err.name}` });
    });
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ message: 'Некорректный id карточки' });
    }
    const card = await cardSchema.findOne({ _id: cardId, likes: userId });
    if (!card) {
      return res.status(400).json({ message: 'Карточка не найдена или пользователь не поставил лайк' });
    }
    const updatedCard = await cardSchema.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true },
    );
    if (!updatedCard) {
      return res.status(500).json({ message: 'Ошибка при обновлении карточки' });
    }
    return res.status(200).json({ data: updatedCard });
  } catch (err) {
    return res.status(500).json({ message: `Произошла ошибка: ${err}` });
  }
};
