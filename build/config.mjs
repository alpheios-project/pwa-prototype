import VueLoaderPlugin from '../node_modules/vue-loader/lib/plugin.js'
import InjectManifest from '../node_modules/workbox-webpack-plugin/build/inject-manifest.js'
import WebpackPwaManifest from 'webpack-pwa-manifest'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import Package from '../package.json'

import path from 'path'
const projectRoot = process.cwd()

const sharedManifestConf = {
  fingerprints: true,
  inject: true,
  ios: {
    'apple-mobile-web-app-title': 'Alpheios Reading Tools PWA',
    'apple-mobile-web-app-status-bar-style': '#73CDDE'
  },
  icons: [
    {
      src: path.resolve('src/images/icon-1024.png'),
      sizes: [36, 48, 72, 96, 144, 192, 512],
      destination: path.join('icons', 'pwa')
    },
    {
      src: path.resolve('src/images/icon-ios-1024.png'),
      sizes: [120, 152, 167, 180, 1024],
      destination: path.join('icons', 'ios'),
      ios: true
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
      new HtmlWebpackPlugin({
        filename: 'caesar-gallic-war.html',
        template: path.join(projectRoot, 'src/content/caesar-gallic-war.html'),
        inject: false
      }),
      new WebpackPwaManifest(Object.assign(
        sharedManifestConf,
        { start_url: 'https://pwa.alpheios.net/index.html' },
        Package.alpheios.pwa
      ))
    ]
  },

  development: {
    mode: 'development',
    output: {filename: 'app.js'},
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(projectRoot, 'src/index-dev.html')
      }),
      new HtmlWebpackPlugin({
        filename: 'caesar-gallic-war.html',
        template: path.join(projectRoot, 'src/content/caesar-gallic-war.html'),
        inject: false
      }),
      new WebpackPwaManifest(Object.assign(
        sharedManifestConf,
        { start_url: 'https://pwa-dev.alpheios.net/index.html' },
        Package.alpheios.pwa
      ))
    ]
  }
}

export { webpack }
