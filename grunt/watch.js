module.exports = function (grunt, options) {
    "use strict";

    return {
        "styles": {
            files: [ '<%= pkg.directories.client %>/less/**/*.less' ],
            tasks: [
                'styles'
            ],
            options: {
                'interrupt': true
            }
        },
        "assets": {
            files: [
                '<%= pkg.directories.client %>/bower_components/**',
                '<%= pkg.directories.client %>/assets/**',
                '<%= pkg.directories.client %>/**/*.html'
            ],
            tasks: [
                'assets'
            ],
            options: {
                'interrupt': true
            }
        }
    };
};