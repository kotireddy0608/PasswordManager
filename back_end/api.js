'use strict';
// /api
const express = require('express');
var router = express.Router();
const {MongoClient} = require('mongodb');
const jose = require('jose');
const crypto = require('crypto');

//env variables
const uri = process.env.MONGOURI || 'mongodb://localhost:27017/';
const JWT_SECRET = crypto.createSecretKey(process.env.JWT_SECRET || 'pandemic-definite-galore-scion' , 'utf-8');
const JWT_EXPIRATIONTIME = process.env.JWT_EXPIRATIONTIME || '1h';
const client = MongoClient.connect(uri);

// a simple ping location to get if the server is up and running
router.get("/" , (req , res)=>{
	res.send("api endpoint :)");
})

//client side validation is required
/*
schema
username : string
password : string
Name : string
email : string
password_hint : string
password_hint_answer : string
*/
// expected behaviour : return a json with status and message for the passed login credentials
router.post("/signup" ,express.json(), async (req , res)=>{
	console.log(req.body);
	if(req.body.username && req.body.password && req.body.Name && req.body.email && req.body.password_hint && req.body.password_hint_answer){
		let db = (await client).db('passwordManager');
		let users = db.collection('users');
		let user = {
			"username":req.body.username,
			"password":crypto.createHash('sha256').update(req.body.password).digest('hex'),
			"Name":req.body.Name,
			"email":req.body.email,
			"password_hint":req.body.password_hint,
			"password_hint_answer":req.body.password_hint_answer
		}
		users.insertOne(user);
		res.json({
			"status":"success"
		});
	}else{
		res.status(400).json(
			{
				"status":"rejected",
				"message":"missing fields"
			});
	}
})

// api to generate valid authenmication tokens for the passed login credentials
/*
schema
username : string
password : string
*/
// expected behaviour : return a json with status and token for the passed login credentials
router.post("/login" ,express.json(), async (req , res)=>{
	console.log('login request from '+req.ip);
	if(req.body.username && req.body.password){
		
		let db = (await client).db('passwordManager');
		let users = db.collection('users');
		
		let user = await users.findOne({"username":req.body.username});
		
		if(user){
			const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
			if(hash === user.password){
				let token = await new jose.SignJWT({
					username:user.username,
					password:user.password
				})
				.setIssuedAt()
				.setExpirationTime(JWT_EXPIRATIONTIME)
				.setProtectedHeader({
					alg: 'HS256',
				})
				.sign(JWT_SECRET);
				console.log('login request is valid from ip '+req.ip+' for user '+user.username);
				res.json({
					status:"success",
					token:token
				});
			}else{
				console.log('login request is invalid from ip '+req.ip+' for user '+user.username + ' password mismatch');
				res.status(401).json({
					status:"reject"
				});
			}
		}else{
			console.log('login request is invalid from ip '+req.ip+' for user '+req.body.username + ' user not found');
			res.status(401).json({
				"status":"reject"
			});
		}
	}else{
		console.log('malformed request from ip '+req.ip);
		res.status(400).json({
			status : 'reject'
		});
	}
	
	
})

// get decrypted data for the user



module.exports = router;