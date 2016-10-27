/*
xml2json v 1.1
copyright 2005-2007 Thomas Frank

This program is free software under the terms of the 
GNU General Public License version 2 as published by the Free 
Software Foundation. It is distributed without any warranty.
*/

xml2json={
	parser:function(xmlcode,ignoretags,debug){
		if(!ignoretags){ignoretags=""};
		xmlcode=xmlcode.replace(/\s*\/>/g,'/>');
		xmlcode=xmlcode.replace(/<\?[^>]*>/g,"").replace(/<\![^>]*>/g,"");
		if (!ignoretags.sort){ignoretags=ignoretags.split(",")};
		var x=this.no_fast_endings(xmlcode);
		x=this.attris_to_tags(x);
		x=escape(x);
		x=x.split("%3C").join("<").split("%3E").join(">").split("%3D").join("=").split("%22").join("\"");
		for (var i=0;i<ignoretags.length;i++){
			x=x.replace(new RegExp("<"+ignoretags[i]+">","g"),"*$**"+ignoretags[i]+"**$*");
			x=x.replace(new RegExp("</"+ignoretags[i]+">","g"),"*$***"+ignoretags[i]+"**$*")
		};
		x='<JSONTAGWRAPPER>'+x+'</JSONTAGWRAPPER>';
		this.xmlobject={};
		var y=this.xml_to_object(x).jsontagwrapper;
		if(debug){y=this.show_json_structure(y,debug)};
		return y
	},
	xml_to_object:function(xmlcode){
		var x=xmlcode.replace(/<\//g,"�");
		x=x.split("<");
		var y=[];
		var level=0;
		var opentags=[];
		for (var i=1;i<x.length;i++){
			var tagname=x[i].split(">")[0];
			opentags.push(tagname);
			level++
			y.push(level+"<"+x[i].split("�")[0]);
			while(x[i].indexOf("�"+opentags[opentags.length-1]+">")>=0){level--;opentags.pop()}
		};
		var oldniva=-1;
		var objname="this.xmlobject";
		for (var i=0;i<y.length;i++){
			var preeval="";
			var niva=y[i].split("<")[0];
			var tagnamn=y[i].split("<")[1].split(">")[0];
			tagnamn=tagnamn.toLowerCase();
			var rest=y[i].split(">")[1];
			if(niva<=oldniva){
				var tabort=oldniva-niva+1;
				for (var j=0;j<tabort;j++){objname=objname.substring(0,objname.lastIndexOf("."))}
			};
			objname+="."+tagnamn;
			var pobject=objname.substring(0,objname.lastIndexOf("."));
			if (eval("typeof "+pobject) != "object"){preeval+=pobject+"={value:"+pobject+"};\n"};
			var objlast=objname.substring(objname.lastIndexOf(".")+1);
			var already=false;
			for (k in eval(pobject)){if(k==objlast){already=true}};
			var onlywhites=true;
			for(var s=0;s<rest.length;s+=3){
				if(rest.charAt(s)!="%"){onlywhites=false}
			};
			if (rest!="" && !onlywhites){
				if(rest/1!=rest){
					rest="'"+rest.replace(/\'/g,"\\'")+"'";
					rest=rest.replace(/\*\$\*\*\*/g,"</");
					rest=rest.replace(/\*\$\*\*/g,"<");
					rest=rest.replace(/\*\*\$\*/g,">")
				}
			} 
			else {rest="{}"};
			if(rest.charAt(0)=="'"){rest='unescape('+rest+')'};
			if (already && !eval(objname+".sort")){preeval+=objname+"=["+objname+"];\n"};
			var before="=";after="";
			if (already){before=".push(";after=")"};
			var toeval=preeval+objname+before+rest+after;
			eval(toeval);
			if(eval(objname+".sort")){objname+="["+eval(objname+".length-1")+"]"};
			oldniva=niva
		};
		return this.xmlobject
	},
	show_json_structure:function(obj,debug,l){
		var x='';
		if (obj.sort){x+="[\n"} else {x+="{\n"};
		for (var i in obj){
			if (!obj.sort){x+=i+":"};
			if (typeof obj[i] == "object"){
				x+=this.show_json_structure(obj[i],false,1)
			}
			else {
				if(typeof obj[i]=="function"){
					var v=obj[i]+"";
					//v=v.replace(/\t/g,"");
					x+=v
				}
				else if(typeof obj[i]!="string"){x+=obj[i]+",\n"}
				else {x+="'"+obj[i].replace(/\'/g,"\\'").replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/\r/g,"\\r")+"',\n"}
			}
		};
		if (obj.sort){x+="],\n"} else {x+="},\n"};
		if (!l){
			x=x.substring(0,x.lastIndexOf(","));
			x=x.replace(new RegExp(",\n}","g"),"\n}");
			x=x.replace(new RegExp(",\n]","g"),"\n]");
			var y=x.split("\n");x="";
			var lvl=0;
			for (var i=0;i<y.length;i++){
				if(y[i].indexOf("}")>=0 || y[i].indexOf("]")>=0){lvl--};
				tabs="";for(var j=0;j<lvl;j++){tabs+="\t"};
				x+=tabs+y[i]+"\n";
				if(y[i].indexOf("{")>=0 || y[i].indexOf("[")>=0){lvl++}
			};
			if(debug=="html"){
				x=x.replace(/</g,"&lt;").replace(/>/g,"&gt;");
				x=x.replace(/\n/g,"<BR>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;")
			};
			if (debug=="compact"){x=x.replace(/\n/g,"").replace(/\t/g,"")}
		};
		return x
	},
	no_fast_endings:function(x){
		x=x.split("/>");
		for (var i=1;i<x.length;i++){
			var t=x[i-1].substring(x[i-1].lastIndexOf("<")+1).split(" ")[0];
			x[i]="></"+t+">"+x[i]
		}	;
		x=x.join("");
		return x
	},
	attris_to_tags: function(x){
		var d=' ="\''.split("");
		x=x.split(">");
		for (var i=0;i<x.length;i++){
			var temp=x[i].split("<");
			for (var r=0;r<4;r++){temp[0]=temp[0].replace(new RegExp(d[r],"g"),"_jsonconvtemp"+r+"_")};
			if(temp[1]){
				temp[1]=temp[1].replace(/'/g,'"');
				temp[1]=temp[1].split('"');
				for (var j=1;j<temp[1].length;j+=2){
					for (var r=0;r<4;r++){temp[1][j]=temp[1][j].replace(new RegExp(d[r],"g"),"_jsonconvtemp"+r+"_")}
				};
				temp[1]=temp[1].join('"')
			};
			x[i]=temp.join("<")
		};
		x=x.join(">");
		x=x.replace(/ ([^=]*)=([^ |>]*)/g,"><$1>$2</$1");
		x=x.replace(/>"/g,">").replace(/"</g,"<");
		for (var r=0;r<4;r++){x=x.replace(new RegExp("_jsonconvtemp"+r+"_","g"),d[r])}	;
		return x
	}
};


if(!Array.prototype.push){
	Array.prototype.push=function(x){
		this[this.length]=x;
		return true
	}
};

if (!Array.prototype.pop){
	Array.prototype.pop=function(){
  		var response = this[this.length-1];
  		this.length--;
  		return response
	}
};

//article domain 객체
function Article(t, c, w) {

	var num = 0;
	var title = t; 
	var content = c;
	var writer = w;
	var readCount = 0;

	this.getNum = function() {
		
		return num;
		
	};
	
	this.setNum = function(n) {
		
		num = n;
		
	};

	this.getTitle = function() {
		
		return title;
		
	};

	this.setTitle = function(t) {
		
		title = t;
		
	};

	this.getContent = function() {
		
		return content;
		
	};

	this.setContent = function(c) {
		
		content = c;
		
	};
	
	this.getWriter = function() {
		
		return writer;
		
	};

	this.setWriter = function(w) {
		
		writer = writer;
		
	};
	
	this.getReadCount = function() {
		
		return readCount;
		
	};

	this.setReadCount = function(rc) {
		
		readCount = rc;
		
	};

}

//article dao 객체
function ArticleDao() {
	
//	글저장 dao 메서드
	this.saveDao = function(article) {
				
		var isSuccess;
		
		try{	
			//요청 정보를 설정 및 서버 호출
//1. XHR 방식
/*			var requestString = '/save?title=' + article.getTitle() + '&content=' + article.getContent() + '&writer=' + article.getWriter();						
			var request = new XMLHttpRequest();
			request.open('GET', requestString, false);
			request.send();
			
//			1. json 방식
//			isSuccess = eval('(' + request.responseText + ')');	
			
//			2. xml 방식
			var xml = request.responseXML;
			var messageValue = xml.getElementsByTagName('message')[0].childNodes[0].nodeValue;
			isSuccess= eval('(' + messageValue + ')');
			
//			3. xml2json 방식(주의 : 변환된 JSON(자바스크립트 객체)의 속성 값은 모두 string으로 변환된다.)
//			var json = xml2json.parser(request.responseText);
//			console.log(json);
//			isSuccess = json.message;
*/
//2. jQuery Ajax 방식	
			$.ajax({
                url: '/save',
                async : false,
                type: 'get',               
                data: {
                    title: article.getTitle(),
                    content: article.getContent(),
                    writer: article.getWriter()
                },
                dataType: 'xml', //서버에서 보내오는 데이터 타입
                success: function (data) {
                	console.log(data);
                	var messageValue =$(data).find('message').text();
                	console.log(messageValue + ", " + typeof(messageValue));
                	isSuccess = eval('(' + messageValue + ')');
                	console.log(isSuccess + ", " + typeof(isSuccess));
                }
            });
		} catch(e) {
			console.log('ArticleDao 객체 : saveDao 메서드에서 예외 발생');
			console.log(e.message);
			isSuccess = undefined;
		}
		
		return isSuccess;
		
	};
	
//	글목록 dao 메서드
	this.selectAllDao = function() {
				
		var articles = [];
		
		try{
			//요청 정보를 설정 및 서버 호출
			var requestString = '/selectAll';
			var request = new XMLHttpRequest();
			request.open('GET', requestString, false);
			request.send();			
			
//			요청 결과(동기식 결과 받음)를 응답받는 것을 출력
//			1. json 방식
//			articles = eval('(' + request.responseText + ')');
			
//			2.xml 방식
			var xml = request.responseXML;			
			var xml_articles = xml.getElementsByTagName('article');

            for (var i = 0; i < xml_articles.length; i++) {            	
            	var article = {
            		num : xml_articles[i].childNodes[0].childNodes[0].nodeValue,
            		title : xml_articles[i].childNodes[1].childNodes[0].nodeValue,
            		writer : xml_articles[i].childNodes[2].childNodes[0].nodeValue,
            		readCount : xml_articles[i].childNodes[3].childNodes[0].nodeValue
            	};
            	
            	articles.push(article);
            }
			
		} catch(e) {
			console.log('ArticleDao 객체 : selectAllDao 메서드에서 예외 발생');
			console.log(e.message);
			articles = undefined;
		}	
		
		return articles;
		
	};
	
//	글조회 dao 메서드
	this.selectOneDao = function(num) {
				
		var article;
		
		try{
			//요청 정보를 설정 및 서버 호출
			var requestString = '/selectOne?num=' + num;
			var request = new XMLHttpRequest();
			request.open('GET', requestString, false);
			request.send();	
			
			//요청 결과(동기식 결과 받음)를 응답받는 것을 출력
//			1. json 방식
//			article = eval('(' + request.responseText + ')');
			
//			2.xml 방식
			var xml = request.responseXML;			
			var xml_articles = xml.getElementsByTagName('article');
                    	
            article = {
        		num : xml_articles[0].childNodes[0].childNodes[0].nodeValue,
        		title : xml_articles[0].childNodes[1].childNodes[0].nodeValue,
        		content : xml_articles[0].childNodes[2].childNodes[0].nodeValue,
        		writer : xml_articles[0].childNodes[3].childNodes[0].nodeValue,
        		readCount : xml_articles[0].childNodes[4].childNodes[0].nodeValue
        	};		
		} catch(e) {
			console.log('ArticleDao 객체 : selectOneDao 메서드에서 예외 발생');
			console.log(e.message);
			article = undefined;
		}	
		
		return article;
		
	};
	
//	글수정 dao 메서드
	this.updateDao = function(article) {
				
		
	};
	
//	글삭제 dao 메서드
	this.deleteDao = function(num) {
				
		var isSuccess;
		
		try{	
			//요청 정보를 설정 및 서버 호출
			var requestString = '/delete?num=' + num;						
			var request = new XMLHttpRequest();
			request.open('GET', requestString, false);
			request.send();
			
//			1. json 방식
//			isSuccess = eval('(' + request.responseText + ')');	
			
//			2. xml 방식
			var xml = request.responseXML;
			var messageValue = xml.getElementsByTagName('message')[0].childNodes[0].nodeValue;
			isSuccess= eval('(' + messageValue + ')');
		} catch(e) {
			console.log('ArticleDao 객체 : deleteDao 메서드에서 예외 발생');
			console.log(e.message);
			isSuccess = false;
		}
		
		return isSuccess;
		
	};
	
}

//article controller 객체
function ArticleController() {

	var dao = new ArticleDao();	
	
//	글쓰기뷰 controller 메서드
	this.requestWriteView = function() {
		
		document.location = "writeView.html";
		
	};
	
//	글저장 controller 메서드
	this.requestSave = function(article) {
		
		var isSuccess = dao.saveDao(article);
		
		if(isSuccess === true) {
			alert('글 저장 성공');
		} else {
			alert('글 저장 실패');
		}
		
		//document.location = 'selectAllView.html';
		
	};
	
//	글목록 controller 메서드
	this.requestSelectAll = function() {
		
		var articles = dao.selectAllDao();
		return articles;
		
	};
	
//	글조회 controller 메서드
	this.requestSelectOne = function(num) {
		
		var article = dao.selectOneDao(num);
		
		var requestUrl = 'selectOneView.html';
		requestUrl = requestUrl + '?num=' + article.num;
		requestUrl = requestUrl + '&title=' + article.title;
		requestUrl = requestUrl + '&content=' + article.content;
		requestUrl = requestUrl + '&writer=' + article.writer;
		requestUrl = requestUrl + '&readCount=' + article.readCount;		
		
		document.location = requestUrl;
		
	};
	
//	글목록뷰 controller 메서드
	this.requestSelectAllView = function() {
		
		document.location = 'selectAllView.html';
		
	};
	
//	글수정 controller 메서드
	this.requestUpdate = function(article) {
		

		
	};
	
//	글삭제 controller 메서드
	this.requestDelete = function(num) {
		
		var isSuccess = dao.deleteDao(num);
		
		if(isSuccess === true) {
			alert('글 삭제 성공');
		} else {
			alert('글 삭제 실패');
		}
		
		document.location = 'selectAllView.html';
		
	};
	
}

//controller 객체(static)
var Controllers = function() {
		
};

Controllers.articleController = new ArticleController();

Controllers.getArticleController = function() {

	return Controllers.articleController;

};