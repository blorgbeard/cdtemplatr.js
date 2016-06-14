var subscribers = {}

module.exports = {
  subscribe: function (name, callback) {
    var list = subscribers[name];
    if (!list) {
      list = [];
    }
    list.push(callback);
    subscribers[name] = list;
  },

  raise(name, args) {
    var list = subscribers[name];
    if (list) {
      list.forEach(callback => callback(args));
    }
  }
};
