const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/mestodb", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", require("./routes/users"));
app.use("/", require("./routes/cards"));

app.use((req, res, next) => {
  req.user = {
    _id: "64ed317e8a488d24cf70c20e", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
