'use strict';
// /api
const express = require('express');
var router = express.Router();
const {MongoClient} = require('mongodb');
const jose = require('jose');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

//env variables
const uri = process.env.MONGOURI || 'mongodb://localhost:27017/';
const JWT_SECRET = crypto.createSecretKey(process.env.JWT_SECRET || 'pandemic-definite-galore-scion' , 'utf-8');
const JWT_EXPIRATIONTIME = process.env.JWT_EXPIRATIONTIME || '1h';
const client = MongoClient.connect(uri);

router.get("/" , (req , res)=>{
	res.send("api endpoint :)");
})
router.post("/login" ,express.json(), async (req , res)=>{
	let db = (await client).db('passwordManager');
	let users = db.collection('users');
	
	let user = await users.findOne({"username":req.body.username});
	
	if(user){
		const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
		if(hash === user.password){
			let token = await new jose.SignJWT({
				username:user.username,
				password:user.password
			}).setExpirationTime(JWT_EXPIRATIONTIME)
			.setProtectedHeader({
				alg: 'HS256',
			})
			.sign(JWT_SECRET);
			res.json({
				status:"success",
				token:token
			});
		}else{
			res.status(401).json({
				status:"reject"
			});
		}
	}else{
		res.status(401).json({
			"status":"reject"
		});
	}
	
	
})
router.post("/signup" ,express.json(), (req , res)=>{
	console.log('signup request '+ req.body);
	res.send(req.body);
})
module.exports = router;