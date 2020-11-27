exports.decode_json = function (arg) {
  var fout = {};

  if (arg) {

    try {

      fout = JSON.parse(arg);
    } catch (err) {
      console.log(err, arg);
      return null;
    }
  }

  return fout;
}



exports.isInt = function(n) {
  return typeof n == 'number' && Math.round(n) % 1 == 0;
}

exports.isValid = function (n) {
  return typeof n != 'undefined' && n != '';
}
