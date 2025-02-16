//webpack.config.js
const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/orb.ts",
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: "orb.js",
    library: "Orb",
    libraryTarget: "var",
    libraryExport: "default"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
