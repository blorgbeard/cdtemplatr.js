function join(array1, array2, keyPropertyName, selectFunction) {
  var compare = function(object1, object2) {
    var value1 = object1[keyPropertyName];
    var value2 = object2[keyPropertyName];
    if (value1 < value2) return -1;
    if (value1 > value2) return 1;
    return 0;
  };
  // sorting in place, but I don't care.
  array1.sort(compare);
  array2.sort(compare);
  var output = [];
  var index1 = 0, index2 = 0;
  while (index1 < array1.length && index2 < array2.length) {
    var object1 = array1[index1];
    var object2 = array2[index2];
    var keyCompare = compare(object1, object2);
    if (keyCompare < 0) {
      index1++;
    } else if (keyCompare > 0) {
      index2++;
    } else {
      output.push(selectFunction(object1, object2));
      index1++;
      index2++;
    }
  }
  return output;
}

module.exports = join;

/*
var a = [{a:1, b:'hi'}, {a:2, b:'yo'}]
var b = [{a:2, c:'hey'},{a:3, c:"fuckya"}]
var c = join(a,b,'a', function(x,y) { return [x.a, x.b, y.c]; });
console.log(c);
*/
