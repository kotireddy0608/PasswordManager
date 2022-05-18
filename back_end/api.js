'use strict';

const express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const jose = require('jose');


const uri = 'mongodb://localhost:27017/';
async function dbconnection(){
	const client = new mongo.MongoClient(uri);
	try{
		await client.connect();
		let db = await client.db('passwordManager').command({ping : 1});
		console.log("mongo successfully connected");
		return db;
	}finally{
		await client.close();
	}
}

const db = dbconnection().catch(console.error);

router.get("/" , (req , res)=>{
	res.send("api endpoint :)");
})
router.post("/login" ,express.json(), async (req , res)=>{
	let users = await db;
	
	users = users.collection('users');
	let user = users.findOne({username : req.body.username});
	if(user){
		if(user.password === req.body.password){
			res.send("login successful");
		}else{
			res.send("wrong password");
		}
	}
})
router.post("/signup" ,express.json(), (req , res)=>{
	console.log(req.body);
	res.send(req.body);
})
module.exports = router;