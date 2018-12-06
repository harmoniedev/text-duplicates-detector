module.exports = {
  entry: './sample.js',
  mode: 'development', 
  output: {
    library: 'dupEs5Lib',
    libraryTarget: 'var',
    filename: 'dupEs5Lib.js'   
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};