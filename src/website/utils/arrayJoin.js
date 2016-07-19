'use strict';

function join1tofirst2(array1, array2, compareFunction, selectFunction) {
  var output = [];
  var index1 = 0, index2 = 0;
  while (index1 < array1.length && index2 < array2.length) {
    var object1 = array1[index1];
    var object2 = array2[index2];
    var keyCompare = compareFunction(object1, object2);
    if (keyCompare < 0) {
      index1++;
    } else if (keyCompare > 0) {
      index2++;
    } else {
      output.push(selectFunction(object1, object2));
      // skip any further matches on the same value
      index1++;
      index2++;
    }
  }
  return output;
}

module.exports = {
  join1tofirst2: join1tofirst2
}
