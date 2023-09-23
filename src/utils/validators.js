const regExpUrl = /^(https?:\/\/)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i;

const urlValidation = (url) => regExpUrl.test(url);

module.exports = { regExpUrl, urlValidation };
