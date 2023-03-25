var http=require('http');
var express=require('express');
var app=express();
var pug=require('pug');
var multer=require('multer');
var fs=require('fs');
var fsx=require('fs-extra');
var changed=true;
var text=require("./static/language")
var language="english";
var upload=multer({dest:'./'});
var bodyParser=require('body-parser');
var server=http.createServer(app).listen(2020);
var session=require('express-session');
var mongodb=require('mongodb');
var MongoClient=mongodb.MongoClient;
var url="mongodb://localhost:27017/";
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static',express.static('./static'));
app.use('/announcements',express.static('./announcements'));
app.use('/homeworks',express.static('./homeworks'));
app.use(session({
	secret:'aliatabak',
	resave:false,
	saveUninitialized:true,
}));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin"),
	res.header("Access-Control-Allow-Headers"),
	next();
});
app.set('view engine','pug');
app.set('views','./static');
app.get('/login',function(req,res){	
	if((req.session.username=="a" && req.session.password=="b") || (req.session.username=="c" && req.session.password=="d")){
		res.redirect('/');
	}
	else{
		res.render('login.pug',{language:language,active_user:req.session.username,active_password:req.session.password,text:text.text});	
	}
});
app.post('/login',function(req,res){	
	req.session.username=req.body.username;
	req.session.password=req.body.password;
	if((req.session.username=="a" && req.session.password=="b") || (req.session.username=="c" && req.session.password=="d")){
		res.redirect('/');
	}
	else{
		res.redirect('/login');
	}
});
app.get('/',function(req,res){
	if((req.session.username=="a" && req.session.password=="b") || (req.session.username=="c" && req.session.password=="d")){
		MongoClient.connect(url,function(err,db){
			if(err) throw err;
			var dbo=db.db("db");
			var project={};
			if(req.session.username=="c"){
				dbo.collection("projects").findOne({student:req.session.username},function(err,result3){
					if(err) throw err;
					project=result3;
				});
			}
			dbo.collection("announcements").find({}).toArray(function(err,result1){
				if(err) throw err;
				dbo.collection("homeworks").find({}).toArray(function(err,result2){
					if(err) throw err;
					var file_found=[];
					if(req.session.username=="c"){
						result2.forEach(function(hw){
							file_found.push(fs.existsSync('./homeworks/uploads/'+hw.header+'/'+req.session.username));
						});
						res.render('main.pug',{active_user:req.session.username,result1:result1,result2:result2,project:project,file_found:file_found,language:language,text:text.text});
					}
					else{
						result2.forEach(function(hw){
							file_found.push(fs.existsSync('./homeworks/uploads/'+hw.header));
						});
						res.render('main.pug',{active_user:req.session.username,result1:result1,result2:result2,changed:changed,file_found:file_found,language:language,text:text.text});
					}
				});
				db.close();
			});
		});
	}
	else{
		res.redirect('/login');
	}
});
app.post('/',upload.array('filetoupload'),function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		var type="";
		var obj={};
		if(err) throw err;
		var dbo=db.db("db");
		if(req.body.advisor!=undefined){
			type="projects";}
		else{
			if(req.body.date==undefined){
				type="announcements";}
			else{
				type="homeworks";}
		}
		if(type!="projects"){
			var files=[];
			req.files.forEach(function(file){
				files.push(file.originalname);
			});
			obj={header:req.body.header,detail:req.body.details,files:files};
			if(type=="homeworks"){
				obj.date=req.body.date;
				obj.time=req.body.time;
			}
			dbo.collection(type).insertOne(obj,function(err,result){
				if(err) throw err;
			});
			dbo.collection(type).findOne(obj,function(err,result){
				if(err) throw err;
				req.files.forEach(function(file){
					fsx.moveSync('./'+file.filename,'./'+type+'/'+result._id+'/'+file.originalname);
				});
				db.close();
			});
		}
		else{
			obj={student:req.body.student,title:req.body.title,advisor:req.body.advisor};
			dbo.collection(type).findOne({student:req.body.student},function(err,result){
				if(err) throw err;
				if(result==null){
					dbo.collection(type).insertOne(obj,function(err,result){
						if(err) throw err;
					});
				}
				else{
					changed=false;
				}
			});
		}
	});			
	res.redirect('/');
});
app.post('/searchProjects',function(req,res){
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		var query=JSON.parse(req.body.query);
		dbo.collection("projects").find(query).toArray(function(err,result){
			res.send(result);
		});
	});
});	
app.post('/update/:type',upload.array('updatefiles'),function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		var id=new mongodb.ObjectId(req.body.id);
		var query={"_id":id};
		var obj={};
		dbo.collection(req.params.type).findOne(query,function(err,result){
			if(err) throw err;	
			if(req.params.type!="projects")
			{
				var files=result.files;
				req.files.forEach(function(file){
					if(!fs.existsSync('./'+req.params.type+'/'+result._id+'/'+file.originalname)){
						files.push(file.originalname);
						fsx.moveSync('./'+file.filename,'./'+req.params.type+'/'+result._id+'/'+file.originalname);
					}
				});
				if(req.params.type=="homeworks"){
					if(fs.existsSync('./homeworks/uploads/'+result.header && result.header!=req.body.new_header)){
						fsx.moveSync('./homeworks/uploads/'+result.header,'./homeworks/uploads/'+req.body.new_header);
					}
				}
				obj={$set:{header:req.body.new_header,detail:req.body.new_details,files:files}};
				if(req.params.type=='homeworks'){
					obj.$set.date=req.body.new_date;
					obj.$set.time=req.body.new_time;
				}
			}
			else{
				obj={$set:{title:req.body.new_title,advisor:req.body.new_advisor}};
			}
			dbo.collection(req.params.type).updateOne(query,obj,function(err,res){
				if(err) throw err;
				console.log(req.params.type+" updated.");
			});	
			db.close();
		});		
	});
	res.redirect('/');
});
app.post('/getIDOfIndex/:type',function(req,res){
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		dbo.collection(req.params.type).find({}).toArray(function(err,result){
			res.send(result[req.body.value]["_id"]);
		});
	});
});
app.post('/delete/:type',function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		var query={};
		if(req.params.type=="projects"){
			var id=mongodb.ObjectId(req.body.value);
			query={_id:id};
		}
		dbo.collection(req.params.type).find(query).toArray(function(err,result){
			if(err) throw err;
			if(req.params.type!="projects")
			{
				query=result[req.body.value];
				if(fs.existsSync('./'+req.params.type+'/'+query._id)){
					fs.rmdirSync('./'+req.params.type+'/'+query._id,{recursive:true});
				}
				if(req.params.type=='homeworks'){
					if(fs.existsSync('./homeworks/uploads/'+query.header)){
						fs.rmdirSync('./homeworks/uploads/'+query.header,{recursive:true});
					}
				}
			}
			dbo.collection(req.params.type).deleteOne(query,function(err,obj){
				if(err) throw err;
				console.log(req.params.type+" deleted.");
				db.close();
			});
		});
	});
	res.redirect('/');
});
app.post('/deleteall/:type',function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		if(req.params.type!="projects")
		{
			if(fs.existsSync('./'+req.params.type)){
				fs.rmdirSync('./'+req.params.type,{recursive:true});	
			}
		}
		dbo.collection(req.params.type).deleteMany({},function(err){
			if(err) throw err;
		});	
	});
	res.redirect('/');
});		
app.post('/deletefile/:type',function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		var id=new mongodb.ObjectId(req.body.value);
		var query={"_id":id};
		dbo.collection(req.params.type).findOne(query,function(err,result){
			if(err) throw err;
			var files=result.files;
			var file=files[req.body.file];
			fs.unlinkSync('./'+req.params.type+'/'+result._id+'/'+file);
			files.splice(req.body.file,1);
			var obj={$set:{files:files}};
			dbo.collection(req.params.type).updateOne(query,obj,function(err,res){
				if(err) throw err;
			});
			db.close();
		});
	});
	res.redirect('/');
});
app.post('/deleteallfiles/:type',function(req,res){
	changed=true;
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		var dbo=db.db("db");
		var id=new mongodb.ObjectId(req.body.value);
		var query={"_id":id};
		dbo.collection(req.params.type).findOne(query,function(err,result){
			if(err) throw err;
			var files=result.files;
			files.forEach(function(file){
				fs.unlink('./'+req.params.type+'/'+result._id+'/'+file,function(err){
					if(err) throw err;
				});
			});
			var obj={$set:{files:[]}};
			dbo.collection(req.params.type).updateOne(query,obj,function(err,res){
				if(err) throw err;
			});
			db.close();
		});
	});
	res.redirect('/');
});
app.post('/uploadhomework',upload.array('hwupload'),function(req,res){
	if(fs.existsSync('./homeworks/uploads/'+req.body.header+'/'+req.session.username)){
		fs.rmdirSync('./homeworks/uploads/'+req.body.header+'/'+req.session.username,{recursive:true});	
	}
	req.files.forEach(function(file){
		fsx.moveSync('./'+file.filename,'./homeworks/uploads/'+req.body.header+'/'+req.session.username+'/'+file.originalname);
	});
	res.redirect('/');
});
app.get('/changelanguage',function(req,res){
	if(language=="turkish"){language="english";}
	else{language="turkish";}
	res.redirect('/');
});
app.get('/download/:hw_header'+'.zip',function(req,res){		
	var os=require('os');
	fs.mkdtemp(os.tmpdir()+'/',function(err,folder){
		if(err) throw err;
		var zipper = require('zip-local');
		if(req.session.username=="c"){
			zipper.sync.zip('./homeworks/uploads/'+req.params.hw_header+'/'+req.session.username).compress().save(folder+'/'+req.params.hw_header+".zip");
		}
		else{
			zipper.sync.zip('./homeworks/uploads/'+req.params.hw_header).compress().save(folder+'/'+req.params.hw_header+".zip");
		}
		return res.sendFile(folder+'/'+req.params.hw_header+".zip");
	});
});
app.get('/logout',function(req,res){
	changed=true;
	req.session.username="";
	req.session.password="";
	res.redirect('/login');
});