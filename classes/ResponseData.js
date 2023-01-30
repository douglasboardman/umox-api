class ResponseData {
  constructor(userInfo, data, message, error) {
    this._userInfo = userInfo;
    this._data = data;
    this._message = message;
    this._error = error;
  }

  setUserInfo(userInfo) {
    this._userInfo = userInfo;
  }

  setData(data) {
    this._data = data;
  }

  setMessage(message) {
    this._message = message;
  }

  setError(error) {
    this._error = error;
  }

  getUserInfo() {
    return this._userInfo;
  }

  getData() {
    return this._data;
  }

  getMessage() {
    return this._message;
  }

  getError() {
    return this._error;
  }
}

module.exports = ResponseData;