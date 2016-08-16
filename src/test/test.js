var assert = require('assert');

var patch = require('../website/app/utils/patch');

describe('getParent', function() {
    it('should return null for the parent of the empty string', function() {
        assert.equal(null, patch.getParent(''));
    });
    it('should return null for the parent of null', function() {
        assert.equal(null, patch.getParent(null));
    });
    it('should return the empty string for the parent of "\\onelevelfolder"', function() {
        assert.equal("", patch.getParent("\\onelevelfolder"));
    });
    it('should return the correct parent for the parent of a nested folder', function() {
        assert.equal("\\one\\level", patch.getParent('\\one\\level\\up'));
    });
});


describe('getCommonParentPath', function() {
    it('should return correct results', function() {
        assert.equal('', patch.getCommonParentPath('\\abc', '\\def'));
        assert.equal('\\abc', patch.getCommonParentPath('\\abc\\def', '\\abc\\ghi'));
        assert.equal('\\abc\\def', patch.getCommonParentPath('\\abc\\def', '\\abc\\def'));
    });
});

describe('patch', function() {    
    it('should work correctly in a simple case', function() {
        const input = [
            '<directory name="">',
            '<file name="\\aardvark"/>',
            '<file name="\\lollipop"/>',
            '<file name="\\xylophone"/>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [
            { xml: '<file name="\\fishies"/>' },
            { xml: '<file name="\\gophers"/>' }
        ];

        const deletions = [
            { xml: '<file name="\\xylophone"/>' }
        ];

        const expected = [
            '<directory name="">',
            '<file name="\\aardvark"/>',
            '<file name="\\fishies"/>',
            '<file name="\\gophers"/>',
            '<file name="\\lollipop"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch.patch(input, additions, deletions);

        assert.equal(expected, output);

    });

    it('should correctly remove a folder and its contents', function() {
        const input = [
            '<directory name="">',
            '<directory name="\\hello">',
            '<file name="\\hello\\lollipop"/>',
            '</directory>',
            '<file name="\\xylophone"/>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [
            { xml: '<file name="\\fishies"/>' },
            { xml: '<file name="\\ziggurat"/>' }
        ];

        const deletions = [
            { xml: '<directory name="\\hello">' },
            { xml: '<file name="\\hello\\lollipop"/>' },
            { xml: '</directory>', directory: "\\hello" },
        ];

        const expected = [
            '<directory name="">',
            '<file name="\\fishies"/>',
            '<file name="\\xylophone"/>',
            '<file name="\\ziggurat"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch.patch(input, additions, deletions);

        assert.equal(expected, output);

    });

    it('should correctly remove nested folders and all contents', function() {
        const input = [
            '<directory name="">',
            '<directory name="\\hello">',
            '<directory name="\\hello\\abc">',
            '<file name="\\hello\\abc\\lollipop"/>',
            '</directory>',
            '</directory>',
            '<file name="\\xylophone"/>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [
            { xml: '<file name="\\fishies"/>' },
            { xml: '<file name="\\ziggurat"/>' }
        ];

        const deletions = [
            { xml: '<directory name="\\hello">' },
            { xml: '<directory name="\\hello\\abc">' },
            { xml: '<file name="\\hello\\abc\\lollipop"/>' },
            { xml: '</directory>', directory: "\\hello\\abc" },
            { xml: '</directory>', directory: "\\hello" },
        ];

        const expected = [
            '<directory name="">',
            '<file name="\\fishies"/>',
            '<file name="\\xylophone"/>',
            '<file name="\\ziggurat"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch.patch(input, additions, deletions);

        assert.equal(expected, output);

    });

    it('should correctly add nested folders and all contents', function() {
        const input = [
            '<directory name="">',            
            '<file name="\\xylophone"/>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [
            { xml: '<directory name="\\abacus">' },
            { xml: '<directory name="\\abacus\\ziggurat">' },
            { xml: '<file name="\\abacus\\ziggurat\\hello.txt"/>' },
            { xml: '<file name="\\abacus\\ziggurat\\world.txt"/>' },
            { xml: '</directory>', directory: "\\abacus\\ziggurat" },
            { xml: '<file name="\\abacus\\hello.txt"/>' },
            { xml: '</directory>', directory: "\\abacus" },
            { xml: '<file name="\\ziggurat"/>' }
        ];

        const deletions = [];

        const expected = [
            '<directory name="">',
            '<directory name="\\abacus">',
            '<directory name="\\abacus\\ziggurat">',
            '<file name="\\abacus\\ziggurat\\hello.txt"/>',
            '<file name="\\abacus\\ziggurat\\world.txt"/>',
            '</directory>',
            '<file name="\\abacus\\hello.txt"/>',
            '</directory>',
            '<file name="\\xylophone"/>',
            '<file name="\\ziggurat"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch.patch(input, additions, deletions);

        assert.equal(expected, output);

    });
});


describe('compare', function() {

    it('should put closing tags before files', function() {
        assert(patch.compare(
            { type: 'directory-end', path: '\\aardvark' }, 
            { type: 'file', path: '\\fishies' }
        ) < 0);        
    });

    it('should sort a child after its parent', function() {
        assert(patch.compare(
            { type: 'directory', path: '' }, 
            { type: 'file', path: '\\aardvark' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\folder' }, 
            { type: 'file', path: '\\folder\\aardvark' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'file', path: '\\folder\\aardvark\\hello' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'directory', path: '\\folder\\aardvark\\hello' }
        ) < 0);        
    });
    it('should sort a descendent after its ancestor', function() {
        assert(patch.compare(
            { type: 'directory', path: '' }, 
            { type: 'file', path: '\\aardvark\\hello' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\folder' }, 
            { type: 'file', path: '\\folder\\aardvark\\hello' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\folder\\aardvark' }, 
            { type: 'directory', path: '\\folder\\aardvark\\hello\\world\\one\\more\\time' }
        ) < 0);
    });
    it('should unrelated files by path', function() {
        assert(patch.compare(
            { type: 'file', path: '\\aardvark\\abacus\\query' }, 
            { type: 'file', path: '\\tiger\\hello' }
        ) < 0);
        assert(patch.compare(
            { type: 'file', path: '\\tiger\\hello' },
            { type: 'file', path: '\\aardvark' }            
        ) < 0);
        assert(patch.compare(
            { type: 'file', path: '\\aardvark\\xylophone\\query.txt' }, 
            { type: 'file', path: '\\aardvark\\hello.txt' }
        ) < 0);
    });    
    it('should sort files after folders', function() {
        assert(patch.compare(
            { type: 'directory', path: '\\zzz' }, 
            { type: 'file', path: '\\aaa' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\root\\zzz' }, 
            { type: 'file', path: '\\root\\aaa' }
        ) < 0);
    });
    it('should sort closing tags at the end of folders', function() {
        assert(patch.compare(
            { type: 'directory', path: '\\zzz' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory', path: '\\zzz\\hello\\world' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);        
        assert(patch.compare(
            { type: 'file', path: '\\zzz\\some-file' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0); 
        assert(patch.compare(
            { type: 'directory-end', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz' }
        ) < 0);
        assert(patch.compare(
            { type: 'directory-end', path: '\\zzz\\hello' }, 
            { type: 'directory-end', path: '\\zzz\\zubat' }
        ) < 0);
    });    
});