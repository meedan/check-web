'use strict';
const path = require('path');

module.exports = (ctx) => ({
    map: ctx.env === 'production' ? false : true,
    plugins: {
        'postcss-import': {},
        'autoprefixer': {
        },
        'postcss-mixins': {
            mixinsDir: path.resolve(__dirname, './src/app/styles/css/mixins')
        },
        'postcss-custom-media': {},
        'postcss-for': {},
        'postcss-preset-env': {
            importFrom: path.resolve(__dirname, './src/app/styles/css/mixins/variables.css'),
            stage: 2,
            preserve: true,
            features: {
                'color-mod-function': true,
                'custom-media-queries': true,
                'nesting': true,
            }
        },
        'postcss-nested': {
            preserveEmpty: false
        },
    }
});
