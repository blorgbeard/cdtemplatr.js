var assert = require('assert');
var compare = require('../../website/app/utils/patch/compare').compare;

describe('compare', function() {

    it('should put closing tags before files', function() {
        assert(compare(
            { type: 'directory-end', path: '\\aardvark' }, 
            { type: 'file', path: '\\fishies' }
        ) < 0);        
    });

    it('should sort a child after its parent', function() {
        assert(compare(
            { type: 'directory', path: '' }, 
            { type: 'file', path: '\\aardvark' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\folder' }, 
            { type: 'file', path: '\\folder\\aardvark' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'file', path: '\\folder\\aardvark\\hello' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'directory', path: '\\folder\\aardvark\\hello' }
        ) < 0);        
    });
    it('should sort a descendent after its ancestor', function() {
        assert(compare(
            { type: 'directory', path: '' }, 
            { type: 'file', path: '\\aardvark\\hello' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\folder' }, 
            { type: 'file', path: '\\folder\\aardvark\\hello' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'directory', path: '\\folder\\aardvark\\hello\\world\\one\\more\\time' }
        ) < 0);
    });
    it('should compare unrelated files by path', function() {
        assert(compare(
            { type: 'file', path: '\\aardvark\\abacus\\query' }, 
            { type: 'file', path: '\\tiger\\hello' }
        ) < 0);
        assert(compare(
            { type: 'file', path: '\\tiger\\hello' },
            { type: 'file', path: '\\aardvark' }
        ) < 0);
        assert(compare(
            { type: 'file', path: '\\aardvark\\xylophone\\query.txt' }, 
            { type: 'file', path: '\\aardvark\\hello.txt' }
        ) < 0);
    });    
    it('should sort files after folders', function() {
        assert(compare(
            { type: 'directory', path: '\\zzz' }, 
            { type: 'file', path: '\\aaa' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\root\\zzz' }, 
            { type: 'file', path: '\\root\\aaa' }
        ) < 0);
    });
    it('should sort closing tags at the end of folders', function() {
        assert(compare(
            { type: 'directory', path: '\\zzz' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\zzz\\hello\\world' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);        
        assert(compare(
            { type: 'file', path: '\\zzz\\some-file' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0); 
        assert(compare(
            { type: 'directory-end', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(compare(
            { type: 'directory-end', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz\\zubat' }
        ) < 0);
    }); 

    it('should sort in case-insensitive mode', function() {
        assert(compare(
            { type: 'directory', path: '\\AAA' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(compare(
            { type: 'directory', path: '\\aaa' }, 
            { type: 'directory-end', path: '\\ZZZ' }
        ) < 0);        
    }); 

    it('should sort underscores before letters', function() {
        assert(compare(
            { type: 'directory', path: '\\_zzz' }, 
            { type: 'directory', path: '\\AAA' }
        ) < 0);
    });

    it('should sort files that are substrings of other files first, excluding extension', function() {

        assert(compare(
            { type: 'file', path: '\\aaa\\visLoyaltyClient.dll' }, 
            { type: 'file', path: '\\aaa\\visLoyaltyClient.xxx' }
        ) < 0);

        assert(compare(
            { type: 'file', path: '\\aaa\\visLoyaltyClient.dll' }, 
            { type: 'file', path: '\\aaa\\visLoyaltyClientEx.dll' }
        ) < 0);

        assert(compare(
            { type: 'file', path: '\\aaa\\visLoyaltyClient.dll' }, 
            { type: 'file', path: '\\aaa\\visLoyaltyClient_x32.reg' }
        ) < 0);
    });

});