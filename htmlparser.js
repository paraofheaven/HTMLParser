/*
HTMLParser By Para Yong
http://ejohn.org/files/htmlparser.js
//useage:

HTMLParser(htmlString,{
	start:function(tag,attrs,unary){},
	end:function(tag){},
	chars:function(text){},
	comment:function(text){}
});

or to inject into an existing document/DOM node
HTMLtoDOM(htmlString,document);
HTMLtoDOM(htmlString,docuement.querySelector(".selector"))

*/



(function(){
	//Regular Expresssions for parsing tags and attributes
	var startTag =/^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*) \s*(\/?)>/,
		endTag =/^<\/([-A-Za-z0-9_]+)[^>]*>/,
		attr =/([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	// Empty Elements - HTML 4.0.1
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
	// Block Elements - HTML 4.0.1
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");
	//Inline Elements - HTML 4.0.1
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strilke,strong,sub,sup,textarea,tt,u,var");
	// Elements that you can leave open then they close themselves
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,mutiple,nohref,noresize,noshade,nowrap,readonly,selected");
	// special Elements that can contain anything
	var special = makeMap("script,style");

	var HTMLParser = this.HTMLParser =function(html,handler){
		var index,chars,match,stack =[],last =html;
		stack.last =function(){
			return this[ this.length -1];
		};
		while(html){
			chars =true;
			//not in a script or style element
			if(!stack.last() || !special[stack.last()]){

				// Comment
				if(html.indexOf("<!--") ==0){
					index =html.indexOf("-->");
					if(index >=0){
						if(handler.comment){
							handler.comment(html.substring(4,index));
							html = html.substring(index +3);
							chars =false;
						}
					}
				}
				// end tag
				else if (html.indexOf("</")==0){
					match =html.match(endTag);
					if(match){
						html.substring(match[0].length);
						match[0].replace(endTag,parseEndTag);
						chars=false;
					}
				}
				// start tag 
				else if(html.indexOf("<") ==0){
					match =html.match(startTag);
					if(match){
						html =html.substring(match[0].length);
						match[0].replace(startTag,parseStartTag);
						chars =false;
					}
				}
				if(chars){
					index =html.indexOf("<");
					var text =index < 0 ? html : html.substring(0,index);
					html =index < 0 ?"" : html.substring(index);
					if(handler.chars){
						handler.chars(text)
					}
				}
			}
		}
		function parseEndTag(tag,tagName){
			// if no tag name is provide,clean shop
			if(!tagName){
				var pos=0;
			}
			// Find the closest opened tag of the same type
			else{
				for(var pos=stack.length -1;pos>=0;pos--){
					if(stack[pos] == tagName){
						break;
					}
				}
			}
			if(pos >=0){
				// Close all the open elements,up the stack
				for(var i= stack.length-1;i>=pos;i--){
					if(handler.end){
						handler.end(stack[i]);
					}
				}
				stack.length =pos;
			}
			
		}
	}

	function makeMap(str){
		var obj={},items=str.split(",");
		for(var i=0;i< items.length;i++){
			obj[items[i]]=true;
		}
		return obj;
	}

})