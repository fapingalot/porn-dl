const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const keysTransformer = require("ts-transformer-keys/transformer").default;
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const { NODE_ENV = "production" } = process.env;

module.exports = {
  entry: {
    background: "./src/background.ts",
    "options-page": "./src/options-page.ts"
  },
  mode: NODE_ENV,
  target: "web",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({})]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          getCustomTransformers: program => ({
            before: [keysTransformer(program)]
          })
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin(
      [
        { from: "**/*.html", context: "src/" },
        { from: "**/*.jpg", context: "src/" },
        { from: "**/*.jpeg", context: "src/" },
        { from: "**/*.png", context: "src/" },
        { from: "**/*.json", context: "src/" }
      ],
      {
        copyUnmodified: true
      }
    )
  ]
};
