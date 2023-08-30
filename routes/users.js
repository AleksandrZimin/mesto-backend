const router = require("express").Router();

router.use((req, res, next) => {
  req.user = {
    _id: "64ed317e8a488d24cf70c20e", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
} = require("../controllers/users");

router.get("/users", getUsers);
router.get("/users/:userID", getUser);
router.post("/users", createUser);
router.patch("/users/me", updateUser);
router.patch("/users/me/avatar", updateAvatar);

module.exports = router;
