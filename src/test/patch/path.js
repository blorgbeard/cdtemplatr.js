var assert = require('assert');
var path = require('../../website/app/utils/patch/path');

describe('getParent', function() {
    it('should return null for the parent of the empty string', function() {
        assert.equal(null, path.getParent(''));
    });
    it('should return null for the parent of null', function() {
        assert.equal(null, path.getParent(null));
    });
    it('should return the empty string for the parent of "\\onelevelfolder"', function() {
        assert.equal("", path.getParent("\\onelevelfolder"));
    });
    it('should return the correct parent for the parent of a nested folder', function() {
        assert.equal("\\one\\level", path.getParent('\\one\\level\\up'));
    });
});

describe('getCommonParentPath', function() {
    it('should return a blank string for paths with no common parent', function() {
        assert.equal('', path.getCommonParentPath('\\abc', '\\def'));        
    });
    it('should return the entire path for identical paths', function() {
        assert.equal('\\abc\\def', path.getCommonParentPath('\\abc\\def', '\\abc\\def'));
    });
    it('should return the common part for paths that share a common part', function() {
        assert.equal('\\abc\\def', path.getCommonParentPath('\\abc\\def\\file1', '\\abc\\def\\file2'));
    });
    it('should return the parent path for a parent and child', function() {
        assert.equal('\\abc\\def', path.getCommonParentPath('\\abc\\def', '\\abc\\def\\file1'));
        assert.equal('\\abc\\def', path.getCommonParentPath('\\abc\\def\\file2', '\\abc\\def'));
    });
});
