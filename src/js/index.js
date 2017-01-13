// entry index.js

import {HTMLtoDOM} from './htmlparser.js'

let htmlString= '<!-- this is the example-->'+
				'<div class="recommend his">'+
                    '<ul>'+
                    	'<p>'+'aaaa'+
                    	'<p>'+'bbb'+
                    	'</p>'+
                    	'</p>'+
                    	'aaa'+
                        '<input disabled>'+
                        '</input>'+
                    	'<style>'+'<--this is css-->.style {position:relative;}'+
                    	'</style>'+
                        '<a href="/market/index" target="_blank">'+
                        '<br/>'+
                        '</a>'+
                    '</ul>'+
                '</div>';
HTMLtoDOM(htmlString,document);
