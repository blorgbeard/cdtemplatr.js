var assert = require('assert');
var parseLine = require('../../website/app/utils/patch/parse').parseLine;

describe('parseLine', function() {
    it('should parse the root folder correctly', function() {
        assert.deepEqual(
          {type: "directory", path: ""}, 
          parseLine('<directory name="">')
        );
    });    
    it('should parse a non-root folder correctly', function() {
        assert.deepEqual(
          {type: "directory", path: "\\foobar"}, 
          parseLine('<directory name="\\foobar">')
        );
    });
    it('should parse a nested folder correctly', function() {
        assert.deepEqual(
          {type: "directory", path: "\\foo\\bar\\baz"}, 
          parseLine('<directory name="\\foo\\bar\\baz">')
        );
    });
    it('should parse a file in the root correctly', function() {
        assert.deepEqual(
          {type: "file", path: "\\foo.html"}, 
          parseLine('<file name="\\foo.html"/>')
        );
    });
    it('should parse a file in the a subfolder correctly', function() {
        assert.deepEqual(
          {type: "file", path: "\\foo\\bar.html"}, 
          parseLine('<file name="\\foo\\bar.html"/>')
        );
    });
    it('should parse a directory-end correctly', function() {
        assert.deepEqual(
          {type: "directory-end", path: "\\foo\\bar"}, 
          parseLine('</directory>', '\\foo\\bar')
        );
    });
    it('should parse the root directory-end correctly', function() {
        assert.deepEqual(
          {type: "directory-end", path: ""}, 
          parseLine('</directory>', '')
        );
    });
    it('should handle special but filename-legal characters', function() {
        assert.deepEqual(
          {type: "file", path: "\\foo_a\\a+b\\G&amp;F\\q\'q\'.xyz"}, 
          parseLine('<file name="\\foo_a\\a+b\\G&amp;F\\q\'q\'.xyz"/>')
        );
    });
});