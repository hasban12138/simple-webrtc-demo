const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  entry: "./src/index.ts",
  mode: 'development',
  devtool: "inline-source-map",

  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8087,
    hot: true,
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
        }

      },
      {
        test: /.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
};
