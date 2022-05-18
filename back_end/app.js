const express = require('express');

const api = require('./api');
const port = process.env.PORT || 5000;
app = express();

app.use('/api' , api);

app.listen(port , ()=>{
	console.log("server started at port "+port);
})