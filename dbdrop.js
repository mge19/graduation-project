var mongodb=require('mongodb');	
var url="mongodb://localhost:27017/";
var MongoClient=mongodb.MongoClient;
MongoClient.connect(url,function(err,db){
	if(err) throw err;
	var dbo=db.db("db");
	dbo.collection("announcements").drop(function(err,res){
		if(err) throw err;
		console.log("Announcements collection dropped!");
	});	
	dbo.collection("homeworks").drop(function(err,res){
		if(err) throw err;
		console.log("Homeworks collection dropped!");
	});	
	dbo.collection("projects").drop(function(err,res){
		if(err) throw err;
		console.log("Projects collection dropped!");
	});	
	db.close();
});