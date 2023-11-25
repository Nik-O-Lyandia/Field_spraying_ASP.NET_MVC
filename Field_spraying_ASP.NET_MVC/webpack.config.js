const webpack = require('webpack');

module.exports = {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    optimization: {
        minimize: false,
    },
    entry: './wwwroot/js/map_script.js',
    output: {
        path: __dirname,
        filename: './wwwroot/js/map_script_bundle.js'
    },
};
