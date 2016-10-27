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
		
		writer = w;
		
	};
	
	this.getReadCount = function() {
		
		return readCount;
		
	};

	this.setReadCount = function(rc) {
		
		readCount = rc;
		
	};

}

//article repository 객체
function ArticleRepository() {
	
	var articleNum = 0; //자동 글번호 증가 및 적용에 사용
	var articles = []; //글목록 저장에 사용
	
	this.getArticleNum = function() {
		
		return articleNum;
		
	};
	
	this.setArticleNum = function(n) {
		
		articleNum = n;
		
	};
	
	this.getArticles = function() {
		
		return articles;
		
	};
	
}

//article dao 객체
function ArticleDao() {
	
	var repository = new ArticleRepository();
		
//	글저장 dao 메서드
	this.saveDao = function(article) {
	
		var isSuccess;
		
		try {			
			repository.setArticleNum(repository.getArticleNum() + 1);
			article.setNum(repository.getArticleNum());
			
			var saved_article = {
				num : article.getNum(),
				title : article.getTitle(),
				content : article.getContent(),
				writer : article.getWriter(),
				readCount : 0
			};
			
			repository.getArticles().push(saved_article);
//			아래와 코드와 같이 사용하면 select 시 값이 아닌 function이 리턴되니 주의 요망.
//			repository.getArticles().push(article);
			isSuccess = { message : true };
		} catch(e) {
			console.log('ArticleDao 객체 : saveDao 메서드에서 예외 발생');
			console.log(e.message);
			isSuccess = { message : false };
		}		
		
		return isSuccess;
		
	};	
	
//	글목록 dao 메서드
	this.selectAllDao = function() {
		
		var send_articles;
		
		try {
			send_articles = repository.getArticles();
		} catch(e) {
			console.log('ArticleDao 객체 : selectAllDao 메서드에서 예외 발생');
			console.log(e.message);
		}		
		
		return send_articles;
		
	};
	
//	글조회 dao 메서드
	this.selectOneDao = function(num) {
	
		var send_article;
		
		try {
			var articles = repository.getArticles();
			
			for(var i = 0 ; i < articles.length ; i++) {								
				if(articles[i].num === num) {
					var new_readCount = articles[i].readCount + 1;
					send_article = articles[i];
					break;
				}
			}
		} catch(e) {
			console.log('ArticleDao 객체 : selectOneDao 메서드에서 예외 발생');
			console.log(e.message);
		}		
		
		return send_article;
		
	};
	
//	글삭제 dao 메서드
	this.deleteDao = function(num) {
	
		var isSuccess;
		
		try {
			var articles = repository.getArticles();
			
			console.log('삭제할 글 번호 : ' + num);
			
			for(var i = 0 ; i < articles.length ; i++) {								
				if(articles[i].num === num) {
					articles.splice(i, 1);
					isSuccess = { message : true };
					break;
				}
			}
		} catch(e) {
			console.log('ArticleDao 객체 : selectOneDao 메서드에서 예외 발생');
			console.log(e.message);
			isSuccess = { message : false };
		}		
		
		return isSuccess;
		
	};
	
}

//article controller 객체
var ArticleController = function() {

	var dao = new ArticleDao();

//	글저장 controller 메서드
	this.requestSave = function(article) {
				
		var isSuccess = dao.saveDao(article);
		return isSuccess;
		
	};
	
//	글목록 controller 메서드
	this.requestSelectAll = function() {
				
		var send_articles = dao.selectAllDao();
		return send_articles;		
	};
	
//	글조회 controller 메서드
	this.requestSelectOne = function(num) {
				
		var send_article = dao.selectOneDao(num);
		return send_article;
		
	};
	
//	글삭제 controller 메서드
	this.requestDelete = function(num) {
				
		var isSuccess = dao.deleteDao(num);
		return isSuccess;
		
	};
	
};

//Node 서버 및 라우터
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

app.use(app.router);

http.createServer(app).listen(3000, function() {
	
	console.log('웹서버 실행 중...http://127.0.0.1:3000');
	
});

var articleController = new ArticleController();

app.all('/save', function(req, res) {
	
	console.log('/save 를 요청 받음.');	
	var title = req.param('title');
	var content = req.param('content');
	var writer = req.param('writer');
	
	var article = new Article(title, content, writer);
	
	var isSuccess = articleController.requestSave(article);
	
//	1. json 방식
//	console.log('응답 데이터');
//	console.log(isSuccess);
//	res.send(isSuccess);
	
//	2. xml 방식
    console.log('응답 데이터');
    var output = '';
    output += '<?xml version="1.0" encoding="UTF-8" ?>';  
    output += '<message>';
    output += isSuccess.message;
    output += '</message>';
    console.log(output);
    res.type('text/xml'); //<- 반드시 기술해야 함. 
    res.send(output);    
	
});

app.all('/selectAll', function(req, res) {
	
	console.log('/selectAll 를 요청 받음.');
	var send_articles = articleController.requestSelectAll();
	
//	1. json 방식
//	console.log('응답 데이터');
//	console.log(send_articles);	
//	res.send(send_articles);
	
//	2. xml 방식	
	console.log('응답 데이터');
	var output = '';
    output += '<?xml version="1.0" encoding="UTF-8" ?>';
    output += '<articles>';
    send_articles.forEach(function (article) {
        output += '<article>';
        output += '<num>' + article.num + '</num>';
        output += '<title>' + article.title + '</title>';
        output += '<writer>' + article.writer + '</writer>';
        output += '<readcount>' + article.readCount + '</readcount>';
        output += '</article>';
    });    
    output += '</articles>';
	console.log(output);
	res.type('text/xml');    
    res.send(output);
	
});

app.all('/selectOne', function(req, res) {
	
	console.log('/selectOne 를 요청 받음.');
	var num = parseInt(req.param('num'));
	var send_article = articleController.requestSelectOne(num);
	
//	1. json 방식
//	console.log('응답 데이터');
//	console.log(send_article);	
//	res.send(send_article);
	
//	2. xml 방식	
	console.log('응답 데이터');
	var output = '';
    output += '<?xml version="1.0" encoding="UTF-8" ?>';
    output += '<article>';
    output += '<num>' + send_article.num + '</num>';
    output += '<title>' + send_article.title + '</title>';
    output += '<content>' + send_article.content + '</content>';
    output += '<writer>' + send_article.writer + '</writer>';
    output += '<readcount>' + send_article.readCount + '</readcount>';
    output += '</article>';
	console.log(output);
	res.type('text/xml');    
    res.send(output);
	
});

app.all('/delete', function(req, res) {
	
	console.log('/delete 를 요청 받음.');	
	var num = parseInt(req.param('num'));
	
	var isSuccess = articleController.requestDelete(num);

	
//	1. json 방식
//	console.log('응답 데이터');
//	console.log(isSuccess);
//	res.send(isSuccess);
	
//	2. xml 방식
    console.log('응답 데이터');
    var output = '';
    output += '<?xml version="1.0" encoding="UTF-8" ?>';  
    output += '<message>';
    output += isSuccess.message;
    output += '</message>';
    console.log(output);
    res.type('text/xml'); //<- 반드시 기술해야 함. 
    res.send(output);
	
});

app.all('/', function(req, res) {
	
	res.redirect('view/article/selectAllView.html');
	
});