class ResponseData {
  constructor(userInfo, data, message, error) {
    this._userInfo = userInfo;
    this._data = data;
    this._message = message;
    this._error = error;
  }

  set userInfo(userInfo) {
    this._userInfo = userInfo;
  }

  set data(data) {
    this._data = data;
  }

  set message(message) {
    this._message = message;
  }

  set error(error) {
    this._error = error;
  }

  get userInfo() {
    return this._userInfo;
  }

  get data() {
    return this._data;
  }

  get message() {
    return this._message;
  }

  get error() {
    return this._error;
  }
}

module.exports = ResponseData;