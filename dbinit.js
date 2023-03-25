var mongodb=require('mongodb');	
var url="mongodb://localhost:27017/";
var MongoClient=mongodb.MongoClient;
MongoClient.connect(url+"db",function(err,db){
	if(err) throw err;
	console.log("Database created.");
	db.close();
});
MongoClient.connect(url,function(err,db){
	if(err) throw err;
	var dbo=db.db("db");
	dbo.createCollection("announcements",function(err,res){
		if(err) throw err;
		console.log("Announcements collection created!");
	});	
	dbo.createCollection("homeworks",function(err,res){
		if(err) throw err;
		console.log("Homeworks collection created!");
	});
	dbo.createCollection("projects",function(err,res){
		if(err) throw err;
		console.log("Projects collection created!");
	});	
	db.close();
});