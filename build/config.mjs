import VueLoaderPlugin from '../node_modules/vue-loader/lib/plugin.js'
import InjectManifest from '../node_modules/workbox-webpack-plugin/build/inject-manifest.js'
import WebpackPwaManifest from 'webpack-pwa-manifest'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import Package from '../package.json'

import path from 'path'
const projectRoot = process.cwd()

const sharedManifestConf = {
  ingerprints: true,
  inject: true,
  icons: [
    {
      src: path.join(path.join(projectRoot, 'src'), 'images/icon.png'),
      sizes: [36, 48, 72, 96, 144, 192, 512],
      destination: 'icons'
    }
  ]
}

const webpack = {
  common: {
    entry: './app.js',
    // externals: ['alpheios-data-models', 'alpheios-inflection-tables'],
    resolve: {
      alias: {
        'alpheios-data-models': path.join(projectRoot, 'node_modules/alpheios-data-models/dist/alpheios-data-models.js'),
        'alpheios-inflection-tables': path.join(projectRoot, 'node_modules/alpheios-inflection-tables/dist/alpheios-inflection-tables.js'),
        'alpheios-components': path.join(projectRoot, 'node_modules/alpheios-components/dist/alpheios-components.js')
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new InjectManifest({
        swSrc: path.join(projectRoot, 'src/sw.js'),
        swDest: 'sw.js',
        importWorkboxFrom: 'cdn',
        globPatterns: ['dist/*.{json,js,html}']
      })
    ]
  },

  production: {
    mode: 'production',
    output: {filename: 'app.min.js'},
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(projectRoot, 'src/index.html')
      }),
      new WebpackPwaManifest(Object.assign(
        sharedManifestConf,
        { start_url: 'https://localhost:8120/index.html' },
        Package.alpheios.pwa
      ))
    ]
  },

  development: {
    mode: 'development',
    output: {filename: 'app.js'},
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index-dev.html',
        template: path.join(projectRoot, 'src/index-dev.html')
      }),
      new WebpackPwaManifest(Object.assign(
        sharedManifestConf,
        { start_url: 'https://localhost:8120/index-dev.html' },
        Package.alpheios.pwa
      ))
    ]
  }
}

export { webpack }
