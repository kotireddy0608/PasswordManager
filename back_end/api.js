'use strict';

const express = require('express');
var router = express.Router();
const mongo = require('mongodb');

router.get("/" , (req , res)=>{
	res.send("api endpoint :)");
})
router.post("/authenticate" , (req , res)=>{
	
})
module.exports = router;