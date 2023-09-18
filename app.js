const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const auth = require('./src/middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb', {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(`Ошибка: ${err}`);
  });
app.use('/', require('./src/routes/auth'));

app.use(auth);
app.use('/users', require('./src/routes/users'));
app.use('/cards', require('./src/routes/cards'));

app.use('/*', (req, res) => res.status(404).send({ message: 'Страницы не существует' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : `Ошибка ${err.statusCode}: ${message}`,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
