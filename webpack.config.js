const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // 빌드 시 dist 디렉토리 정리
        assetModuleFilename: 'assets/[name][ext]', // 파일을 dist/assets 디렉토리에 복사
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif|svg|glb|gltf)$/,
                type: 'asset/resource', // 텍스처 파일을 dist로 복사
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' }, // src/assets를 dist/assets로 복사
            ],
        }),
    ],
    resolve: {
        fallback: {
            fs: false, // 'fs' 모듈을 무시
            path: false, // 'path' 모듈을 무시
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
    mode: 'development',
};