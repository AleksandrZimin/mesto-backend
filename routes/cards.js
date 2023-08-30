const router = require("express").Router();

router.use((req, res, next) => {
  req.user = {
    _id: "64ed317e8a488d24cf70c20e", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require("../controllers/cards");

router.get("/cards", getCards);
router.post("/cards", createCard);
router.delete("/cards/:cardId", deleteCard);
router.put("/cards/:cardId/likes", likeCard);
router.delete("/cards/:cardId/likes", dislikeCard);

module.exports = router;
