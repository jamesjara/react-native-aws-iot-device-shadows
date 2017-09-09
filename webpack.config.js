var Webpack = require('webpack');

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "aws-iot-device-sdk-js-react-native.js",
        libraryTarget: 'umd',
        library: 'pro1'
    },
    node: {
        fs: 'empty',
        tls: 'empty'
    },
    plugins: [
        new Webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true
            }
        })
    ]
};
