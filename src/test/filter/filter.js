'use strict';

var assert = require('assert');
var filter = require('../../website/app/utils/filter/filter');

describe('deconstructIndex', function() {
  it('should work', function() {
    assert.deepEqual({itemIndex: 0, indexIntoItem: 4}, filter.deconstructIndex(4, ["hello", "world"]));    
    assert.deepEqual({itemIndex: 1, indexIntoItem: 0}, filter.deconstructIndex(6, ["hello", "world"]));
    assert.deepEqual({itemIndex: 2, indexIntoItem: 0}, filter.deconstructIndex(4, ["1","2","3","4"]));  // "1 2 3 4"
  });
  it('should return the index of the space before a word if that\'s where the index points', function() {
    assert.deepEqual({itemIndex: 1, indexIntoItem: -1}, filter.deconstructIndex(5, ["hello", "world"]));
  });
});

describe('chopFieldList', function() {
  it('should correctly extract entire words', function() {
    assert.deepEqual({0:"the"}, filter.chopFieldList(0, 2, ["the","quick","brown","fox"]));
    assert.deepEqual({1:"quick"}, filter.chopFieldList(3, 9, ["the","quick","brown","fox"]));    
    assert.deepEqual({1:"quick"}, filter.chopFieldList(3, 9, ["the","quick","brown","fox"]));
    assert.deepEqual({1:"quick",2:"brown"}, filter.chopFieldList(4, 14, ["the","quick","brown","fox"]));
    assert.deepEqual({1:"quick",2:"brown"}, filter.chopFieldList(4, 15, ["the","quick","brown","fox"]));    
    assert.deepEqual({1:"quick",2:"brown",3:"fox"}, filter.chopFieldList(4, 18, ["the","quick","brown","fox"]));
  });
  it('should correctly extract part of one word', function() {
    assert.deepEqual({0:"h"}, filter.chopFieldList(1, 1, ["the","quick","brown","fox"]));
    assert.deepEqual({0:"he"}, filter.chopFieldList(1, 2, ["the","quick","brown","fox"]));
  });
  it('should correctly extract arbitrary sections', function() {    
    assert.deepEqual({0:"the",1:"quick",2:"b"}, filter.chopFieldList(0, 10, ["the","quick","brown","fox"]));
    assert.deepEqual({1:"ick",2:"bro"}, filter.chopFieldList(6, 12, ["the","quick","brown","fox"]));    
  });
  it('should return an empty object if the range is zero-width', function() {
      assert.deepEqual({}, filter.chopFieldList(13, 12, ["the","quick","brown","fox"]));
  });
});

describe('filter', function() {
  it('should not match when a substring or acronym is not found', function() {
    assert.equal(false, filter.apply("XXX", ["Head Office", "Dev"]));    
    assert.equal(false, filter.apply("efv", ["Head Office", "Dev"]));
    assert.equal(false, filter.apply("hoz", ["Head Office", "Dev"]));
  });
  it('should match anything when the filter is blank', function() {
    assert.ok(filter.apply("", ["Head Office", "Dev"]));    
  });
  it('should match substrings and acronyms', function() {
    assert.ok(filter.apply("hod", ["Head Office", "Dev"]));
    assert.ok(filter.apply("head", ["Head Office", "Dev"]));
    assert.ok(filter.apply("HDE", ["Head Office", "Dev"]));
//    assert.ok(filter.apply("ffic", ["Head Office", "Dev"]));
  });
  it('should highlight substring matches correctly', function() {
    const build = ["Best Head Office Product", "Private Dev"];
    assert.deepEqual([[{match:"Best"},{text:" Head Office Product"}], [{text:"Private Dev"}]], filter.apply("best", build));    
  });
  it('should highlight acronym matches correctly', function() {
    const build = ["Best Head Office Product", "Private Dev"];
    assert.deepEqual([[{match:"B"},{text:"est "},{match:"H"},{text:"ead Office Product"}], [{text:"Private "}, {match:"Dev"}]], filter.apply("bhdev", build));    
  });
  it('should match complete matches that occur after partial matches', function() {
    assert.deepEqual([[{text:"China "},{match:"Cin"},{text:"ema"}], [{text:"Dev"}]], filter.apply("cin", ["China Cinema", "Dev"]));    
    assert.deepEqual([[{match:"C"},{text:"hina "},{match:"Ha"},{text:"s Cinema"}], [{text:"Dev"}]], filter.apply("cha", ["China Has Cinema", "Dev"]));
  });
  it('work for filters that match at the end of a field', function() {
    assert.deepEqual([[{match:"LED"}], [{text:"Dev"}]], filter.apply("led", ["LED", "Dev"]));        
  });
});  
