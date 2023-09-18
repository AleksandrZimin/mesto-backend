const regExpUrl = /https?:\/\/(www\.)?[a-z0-9.-]{2,}\.[a-z]{2,}\/?[-._~:/?#[\]@!$&'()*+,;=]*/;

const urlValidation = (url) => regExpUrl.test(url);

module.exports = urlValidation;
