var assert = require('assert');
var patch = require('../../website/app/utils/patch/patch').patch;

describe('patch', function() {    
    it('should work correctly in a simple case', function() {
        const input = [
            '<directory name="">',
            '<file name="\\Aardvark"/>',
            '<file name="\\lollipop"/>',
            '<file name="\\Xylophone"/>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [
            { xml: '<file name="\\fishies"/>' },
            { xml: '<file name="\\gophers"/>' }
        ];

        const deletions = [
            { xml: '<file name="\\Xylophone"/>' }
        ];

        const expected = [
            '<directory name="">',
            '<file name="\\Aardvark"/>',
            '<file name="\\fishies"/>',
            '<file name="\\gophers"/>',
            '<file name="\\lollipop"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch(input, additions, deletions);

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

        const output = patch(input, additions, deletions);

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
        
        const additions = [];

        const deletions = [
            { xml: '<directory name="\\hello">' },
            { xml: '<directory name="\\hello\\abc">' },
            { xml: '<file name="\\hello\\abc\\lollipop"/>' },
            { xml: '</directory>', directory: "\\hello\\abc" },
            { xml: '</directory>', directory: "\\hello" },
        ];

        const expected = [
            '<directory name="">',
            '<file name="\\xylophone"/>',
            '</directory>'
        ].join('\r\n');

        const output = patch(input, additions, deletions);

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

        const output = patch(input, additions, deletions);

        assert.equal(expected, output);
    });

    it('should correctly add a file to a folder whose name is an extension of a previous folder', function() {
        const input = [
            '<directory name="">',   
                '<directory name="\\_InitialBuild">',   
                    '<file name="\\_InitialBuild\\1_build_VISTA_3_00_00.sql"/>',
                '</directory>',
                '<directory name="\\_Install_Customisation">',
                    '<directory name="\\_Install_Customisation\\Customers">',
                        '<directory name="\\_Install_Customisation\\Customers\\Brazil">',                            
                        '</directory>',
                    '</directory>',
                '</directory>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [                        
            { xml: '<file name="\\_Install_Customisation\\Customers\\Brazil\\Vista.Brazil.TaxNumber.Common.dll"/>' }            
        ];

        const deletions = [];

        const expected = [
            '<directory name="">',   
                '<directory name="\\_InitialBuild">',   
                    '<file name="\\_InitialBuild\\1_build_VISTA_3_00_00.sql"/>',
                '</directory>',
                '<directory name="\\_Install_Customisation">',
                    '<directory name="\\_Install_Customisation\\Customers">',
                        '<directory name="\\_Install_Customisation\\Customers\\Brazil">',                            
                            '<file name="\\_Install_Customisation\\Customers\\Brazil\\Vista.Brazil.TaxNumber.Common.dll"/>',            
                        '</directory>',
                    '</directory>',
                '</directory>',
            '</directory>'
        ].join('\r\n');

        const output = patch(input, additions, deletions);

        assert.equal(expected, output);

    });


    it('should insert added files into the correct folders', function() {
        const input = [
            '<directory name="">',   
                '<directory name="\\Database">',   
                    '<directory name="\\Database\\_RunFirst">',
                        '<file name="\\Database\\_RunFirst\\SomeFile.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\0b_Migrate">',
                        '<file name="\\Database\\0b_Migrate\\medium.sql"/>',
                        '<file name="\\Database\\0b_Migrate\\zebra.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\1a_First">',
                    '</directory>',
                    '<directory name="\\Database\\2c_Second">',
                        '<file name="\\Database\\2c_Second\\Aardvark.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\9z_Last">',
                        '<file name="\\Database\\9z_Last\\zoology.sql"/>',
                    '</directory>',
                '</directory>',
            '</directory>'
        ].join('\r\n');
        
        const additions = [                        
            { xml: '<file name="\\Database\\0b_Migrate\\mediumlarge.sql"/>' },
            { xml: '<file name="\\Database\\1a_First\\hello.sql"/>' },
            { xml: '<file name="\\Database\\1a_First\\World.sql"/>' },
            { xml: '<file name="\\Database\\9z_Last\\abacus.sql"/>' },
        ];

        const deletions = [];

        const expected = [
             '<directory name="">',   
                '<directory name="\\Database">',   
                    '<directory name="\\Database\\_RunFirst">',
                        '<file name="\\Database\\_RunFirst\\SomeFile.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\0b_Migrate">',
                        '<file name="\\Database\\0b_Migrate\\medium.sql"/>',
                        '<file name="\\Database\\0b_Migrate\\mediumlarge.sql"/>',
                        '<file name="\\Database\\0b_Migrate\\zebra.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\1a_First">',
                        '<file name="\\Database\\1a_First\\hello.sql"/>',
                        '<file name="\\Database\\1a_First\\World.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\2c_Second">',
                        '<file name="\\Database\\2c_Second\\Aardvark.sql"/>',
                    '</directory>',
                    '<directory name="\\Database\\9z_Last">',
                        '<file name="\\Database\\9z_Last\\abacus.sql"/>',
                        '<file name="\\Database\\9z_Last\\zoology.sql"/>',
                    '</directory>',
                '</directory>',
            '</directory>'
        ].join('\r\n');

        const output = patch(input, additions, deletions);

        assert.equal(expected, output);

    });
    
});

