
function asDefault(value1, value2) {
  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  return 0;
}

function asVersion(value1, value2) {
  var split1 = value1.split('.').map(Number);
  var split2 = value2.split('.').map(Number);
  for (var i=0; i<split1.length && i<split2.length; i++) {
    var compared = asDefault(split1[i], split2[i]);
    if (compared != 0) return compared;
  }
  if (split1.length < split2.length) return -1;
  if (split1.length > split2.length) return 1;
  return 0;
}

function asVersionPrefix(value1, value2) {
  if (value1 == "" || value2 == "") {
    // an empty string is a prefix of everything (because I say so)
    return 0;
  }
  var split1 = value1.split('.').map(Number);
  var split2 = value2.split('.').map(Number);
  for (var i=0; i<split1.length && i<split2.length; i++) {
    var compared = asDefault(split1[i], split2[i]);
    if (compared != 0) return compared;
  }
  // if they were the same while they both had numbers, they're the same.
  return 0;
}

function max(input, propertyFunction, compareFunction) {
  if (!input || input.length == 0) {
    return null;
  }
  var value = propertyFunction(input[0]);
  var result = input[0];
  for (var i=1; i<input.length; i++) {
    var newValue = propertyFunction(input[i]);
    if (compareFunction(newValue, value) > 0) {
      value = newValue;
      result = input[i];
    }
  }
  return result;
}

module.exports = {
  asDefault: asDefault,
  asVersion: asVersion,
  asVersionPrefix: asVersionPrefix,
  max: max
};
