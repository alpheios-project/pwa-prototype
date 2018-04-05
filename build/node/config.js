const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const {InjectManifest} = require('workbox-webpack-plugin')
const projectRoot = process.cwd()

module.exports = {
  style: {
    tasks: []
  },
  image: {
    tasks: []
  },
  webpack: {
    common: {
      resolve: {
        alias: {
          // Below will force all imported modules with unresolved dependencies to use a single instance of that dependency
          'alpheios-data-models': path.join(projectRoot, 'node_modules/alpheios-data-models/dist/alpheios-data-models.js'),
          'alpheios-inflection-tables': path.join(projectRoot, 'node_modules/alpheios-inflection-tables/dist/inflection-tables.module-external.js')
        },
        mainFields: ['moduleExternal', 'module', 'main']
      },
      devtool: 'source-map'
    },
    tasks: [
      {
        context: path.resolve(__dirname, '../../src/'),
        entry: './app.js',
        output: {
          path: path.resolve(__dirname, '../../dist'),
          filename: 'app.js',
          libraryTarget: 'umd'
        },
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: 'vue-loader'
            },
            {
              test: /\.js$/,
              use: ['source-map-loader'],
              enforce: 'pre'
            },
            {
              test: /\.(jpg|png)$/,
              use: [{
                loader: 'url-loader',
                options: {
                  limit: 25000
                }
              }]
            },
            {
              test: /\.svg$/,
              loader: 'svg-inline-loader'
            },
            {
              test: /\.css$/,
              use: [
                MiniCssExtractPlugin.loader,
                'css-loader'
              ]
            },
            {
              test: /\.scss$/,
              use: [
                MiniCssExtractPlugin.loader,
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: true
                  }
                }
              ]
            }
          ]
        },
        plugins: [
          new MiniCssExtractPlugin({
            // TODO: How to output into a subdir? path seems to be not working
            filename: 'style.css'
          }),
          new CleanWebpackPlugin(['../../dist/*.*'], {
            allowExternal: true,
            exclude: [],
            verbose: true,
            dry: false
          }),
          new InjectManifest({
            swSrc: path.join(projectRoot, 'src/sw.js'),
            swDest: 'sw.js',
            importWorkboxFrom: 'local'
          }),
          new VueLoaderPlugin()
        ]
      }
    ]
  }
}
