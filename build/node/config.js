const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const {InjectManifest} = require('workbox-webpack-plugin')

module.exports = {
  pathToProjectRoot: '../..',
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
          'alpheios-data-models': path.resolve(__dirname, '../../node_modules/alpheios-data-models/dist/alpheios-data-models.js')
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
              test: /\.js$/,
              use: ['source-map-loader'],
              enforce: 'pre'
            }
          ]
        },
        plugins: [
          new CleanWebpackPlugin(['../../dist/*.*'], {
            allowExternal: true,
            exclude: [],
            verbose: true,
            dry: false
          }),
          new InjectManifest({
            swSrc: 'sw.js',
            swDest: 'sw.js',
            importWorkboxFrom: 'local'
          })

        ]
      }
    ]
  }
}
