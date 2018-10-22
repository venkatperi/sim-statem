const path = require( 'path' );
const webpack = require( 'webpack' );
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )


const mode = process.env.NODE_ENV || 'production';

module.exports = {
  mode,

  entry: './src/main.ts',

  output: {
    path: path.resolve( __dirname, './dist' ),
  },

  plugins: [
    new VueLoaderPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },

      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },

      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },

  devServer: {
    historyApiFallback: true,
    noInfo: true,
  },

  performance: {
    hints: false,
  },

  devtool: '#eval-source-map',
};

if ( process.env.NODE_ENV === 'production' ) {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat( [
    new webpack.DefinePlugin( {
      'process.env': {
        NODE_ENV: '"production"',
      },
    } ),
    new webpack.optimize.UglifyJsPlugin( {
      sourceMap: true,
      compress: {
        warnings: false,
      },
    } ),
    new webpack.LoaderOptionsPlugin( {
      minimize: true,
    } ),
  ] );
}
