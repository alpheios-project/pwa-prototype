const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const { VueLoaderPlugin } = require('vue-loader')
const {InjectManifest} = require('workbox-webpack-plugin')
const projectRoot = process.cwd()
const sourceDir = path.join(projectRoot, 'src')
const destDir = path.join(projectRoot, 'dist')
console.log(`Source and dest dirs:`, sourceDir, destDir)

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
          new InjectManifest({
            swSrc: path.join(projectRoot, 'src/sw.js'),
            swDest: 'sw.js',
            importWorkboxFrom: 'local'
          }),
          new VueLoaderPlugin(),
          new HtmlWebpackPlugin({
            template: path.join(projectRoot, 'src/index.html')
          }),
          new WebpackPwaManifest({
            name: 'Alpheios PWA',
            short_name: 'Alpheios PWA',
            fingerprints: true,
            inject: true,
            lang: 'en-US',
            start_url: 'https://localhost:8120/index.html',
            display: 'standalone',
            theme_color: '#73CDDE',
            background_color: '#333333',
            icons: [
              {
                src: path.join(sourceDir, 'images/icon.png'),
                sizes: [36, 48, 72, 96, 144, 192, 512],
                destination: 'icons'
              }
            ]
          }),
          /* new CopyWebpackPlugin([
            { from: path.join(sourceDir, 'icons'), to: path.join(destDir, 'icons') }
          ], {}), */
          new CleanWebpackPlugin([ path.join(destDir, '*.*') ], {
            allowExternal: true,
            exclude: [],
            verbose: true,
            dry: false
          })
        ]
      }
    ]
  }
}
