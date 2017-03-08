/*
HTMLParser By Para Yong
useage:

test for branch test
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


	//Regular Expresssions for parsing tags and attributes
	// returns:
	// 1：full regexp object,
	// 2：the first split object ,the second...(split with "()" );
	// 3：example: <div class="remain">  div class="remain" ""

	const STARTTAG=/^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,

	// returns:
	// example: </div> div 
		ENDTAG =/^<\/([-A-Za-z0-9_]+)[^>]*>/,

	// returns:
	// example: class='homeIndex pis' class homeIndex&pis
		ATTR =/([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	// Empty Elements - HTML 4.0.1
	const EMPTY = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
	// Block Elements - HTML 4.0.1
	const BLOCK = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");
	//Inline Elements - HTML 4.0.1
	const INLINE = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strilke,strong,sub,sup,textarea,tt,u,var");
	// Elements that you can leave open then they close themselves
	const CLOSESELF = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
	// Attributes that have their values filled in disabled="disabled"
	const FILLATTRS = makeMap("checked,compact,declare,defer,disabled,ismap,mutiple,nohref,noresize,noshade,nowrap,readonly,selected");
	// special Elements that can contain anything
	const SPECIAL = makeMap("script,style");

	let HTMLParser =(html,handler)=>{
		let index,chars,match,stack =[],last =html;
		stack.last =()=>{
			return stack[ stack.length -1];
		};
		while(html){
			chars =true;
			//not in a script or style element
			if(!stack.last() || !SPECIAL.get(stack.last())){

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
					match =html.match(ENDTAG);
					if(match){
						html =html.substring(match[0].length);
						match[0].replace(ENDTAG,parseEndTag);
						chars=false;
					}
				}
				// start tag 
				else if(html.indexOf("<") ==0){
					match =html.match(STARTTAG);
					if(match){
						html =html.substring(match[0].length);
						match[0].replace(STARTTAG,parseStartTag);
						chars =false;
					}
				}
				if(chars){
					index =html.indexOf("<");
					let text =index < 0 ? html : html.substring(0,index);
					html =index < 0 ?"" : html.substring(index);
					if(handler.chars){
						handler.chars(text)
					}
				}
			}else {
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"),(all,text)=>{
					text =text.replace(/<--(.*?)-->/g,"$1")
							.replace(/<!\[CDATA\[(.*?)]]>/g,"$1");
					if(handler.chars){
						handler.chars(text);
					}
					return "";
				});
				parseEndTag("",stack.last());
			}
			if(html == last ){
				throw "Parse Error: " + html;
			}
			last = html;
		}
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag(tag,tagName,rest,unary){
			tagName =tagName.toLowerCase();

			if(BLOCK.get(tagName)){
				while(stack.last() && INLINE.get(stack.last())){
					parseEndTag("",stack.last());
				}
			}
			if(CLOSESELF.get(tagName) && stack.last() == tagName){
				parseEndTag("",tagName);
			}
			unary =EMPTY.get(tagName) || !!unary;

			if(!unary){
				stack.push(tagName);
			}
			if(handler.start){
				var attrs =[];
				rest.replace(ATTR,function(match,name){
					var value=arguments[2] ? arguments[2]:
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						FILLATTRS.get(name) ? name : '';
					attrs.push({
						name:name,
						value:value,
						escaped: value.replace(/(^|[^\\])"/g,'$1\\\"')
					})
				});
				if(handler.start){
					handler.start(tagName,attrs,unary);
				}
			}
		}

		function parseEndTag(tag,tagName){
			// if no tag name is provide,clean shop
			let pos;
			if(!tagName){
				pos=0;
			}
			// Find the closest opened tag of the same type
			else{
				for(pos=stack.length -1;pos>=0;pos--){
					if(stack[pos] == tagName){
						break;
					}
				}
			}
			if(pos >=0){
				// Close all the open elements,up the stack
				for(let i= stack.length-1;i>=pos;i--){
					if(handler.end){
						handler.end(stack[i]);
					}
				}
				stack.length =pos;
			}
		}
	};

	window.HTMLtoDOM =(html,doc)=>{
		//There can be only one of these elements
		const ONE = makeMap("html,head,body,title");

		// Enforce a structure for the document
		const STRUCTURE ={
			link:'head',
			base:'head'
		};
		if(!doc){
			// for XML
			// if(typeof DOMDocument !="undefined"){
			// 	doc =new DOMDocument();
			// }else 
			if(typeof document != "undefined" && document.implementation && document.implementation.createDocument){
				doc = document.implementation.createDocument("","",null);
			}else if(typeof ActiveX !="undefined"){
				doc = new ActiveXObject("Msxml.DOMDocument");
			}
		}else{
			doc = doc.ownerDocument || 
					doc.getOwnerDocument && doc.getOwnerDocument() ||
					doc;
		}
		let elems=[],
			documentElement =doc.documentElement ||
				doc.getDocumentElement && doc.getDocumentElement();
		// If we're dealing with an empty document then we
		// need to pre-populate it with the HTML document structure
		if(!documentElement && doc.createElement){
			(function(){
				var html =doc.createElement("html");
				var head =doc.createElement("head");
				head.appendChild(doc.createElement("title"));
				html.appendChild(head);
				html.appendChild(doc.createElement("body"));
				doc.appendChild(html);
			})();
		}
		// Find all the unique elements
		if(doc.getElementsByTagName){
			ONE.forEach((value,key) => ONE.set(key,doc.getElementsByTagName(key)[0]));
		}
		// if we're working with a document ,inject contents into body element
		var curParentNode =ONE.get("body");

		HTMLParser(html,{
			start:(tagName,attrs,unary)=>{
				// if it's a pre-build element ,then we can ignore its construction
				if(ONE.get(tagName)){
					curParentNode  =ONE.get(tagName);
					if(!unary){
						elems.push(curParentNode);
					}
					return;
				}
				let elem =doc.createElement(tagName);
				for(let attr in attrs){
					elem.setAttribute(attrs[attr].name,attrs[attr].value);
				}
				if(STRUCTURE[tagName] && typeof(ONE.get(STRUCTURE[tagName]) != "boolean") ){
					ONE.get(STRUCTURE[tagName]).appendChild(elem);
				}
				else if (curParentNode && curParentNode.appendChild){
					curParentNode.appendChild(elem);
				}
				if(!unary){
					elems.push(elem);
					curParentNode =elem
				}
			},
			end:(tag)=>{
				elems.length -=1;

				//Init the new parentNode
				curParentNode =elems [elems.length -1];
			},
			chars:(text)=>{
				curParentNode.appendChild(doc.createTextNode(text))
			},
			comment:(text)=>{
				// create comment node
			}
		});

		return doc;
	}

	function makeMap(str){
		let m =new Map(),
		    items=str.split(",");
		items.forEach((value) => m.set(value,true));
		return m;
	}


export {HTMLParser,HTMLtoDOM}