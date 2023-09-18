class Success extends Error {
  constructor(message) {
    super(message);
    this.name = 'OK';
    this.statusCode = 200;
  }
}

module.exports = Success;
