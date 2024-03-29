const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: '[name].bundle.js',
        publicPath: '',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inlineSource: '.(js|css)$',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname, './node_modules'),
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env' ],
                },
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|mp3)$/,
                use: 'file-loader',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: 'file-loader',
            },
            {
                test: /\.glsl/,
                use: 'raw-loader',
            },
        ]
    }
};
