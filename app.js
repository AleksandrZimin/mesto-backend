const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb', {
    useNewUrlParser: true,
  })
  .then(() => {
    process.stdout.write('Connected to DB');
  })
  .catch((err) => {
    process.stdout.write(`Ошибка: ${err}`);
  });

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.get('*', (req, res) => res.status(404).send('Страница не найдена'));

app.use((req, res, next) => {
  req.user = {
    _id: '64ed317e8a488d24cf70c20e', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  process.stdout.write(`App listening on port ${PORT}`);
});
