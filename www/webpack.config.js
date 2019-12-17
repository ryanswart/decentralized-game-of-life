const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
console.log("process.env.CONTRACT_ID", process.env.CONTRACT_ID);
module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(["index.html"]),
    new webpack.DefinePlugin({
      "process.env.WAVELET_API_URL": JSON.stringify(
        process.env.WAVELET_API_URL
      ),
      "process.env.CONTRACT_ID": JSON.stringify(process.env.CONTRACT_ID)
    })
  ]
};
