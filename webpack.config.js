var path = require('path');
var webpack =require("webpack");
var commonsPlugin =new webpack.optimize.CommonsChunkPlugin('common.js');
var uglifyJsPlugin=new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}});

module.exports ={
	plugins:[commonsPlugin,uglifyJsPlugin],
	entry:{
		index: './src/js/index.js'
	},
	output:{
		path:'./dist/js/',
		filename:'[name].js'
	},
	module:{
		loaders:[
			{ test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
		]
	},
	// 转es5
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    },
	resolve:{
		root:'D:/JD/nodework/HTMLParser/src',
		extensions:['','.js','.json','.scss'],
		alias:{

		}
	}
}