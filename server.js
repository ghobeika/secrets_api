//This is the main server and router of the api
//It will handle the routing of the requests and 
//the responses. 
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var bp = require('body-parser');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = require('./models/user');
var config = require('./config');
var bCrypt = require('bcrypt-nodejs');

app = express();
app.use(bp.urlencoded({extend: false}))
app.use(bp.json());
mongoose.connect(config.database);
const server_options = {  
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem'),
	passphrase: 'test'
};

var apiRouter = express.Router();

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

var tokenVerify = function(req,res,next){ // this is a "middleware" to do token verification 
	var token = req.body.token || req.query.token || req.headers['x-access-token']
	if(token){
		jwt.verify(token, config.secret, function(err,decoded){
			if(err){
				return res.json({message: "Token could not be authenticated"});
			} else {
				req.username = decoded.user // the decoded JWT contains the username 
				next();
			}
		})
	}else{
		return res.status(403).send({
			message: "No token given"
		})
	}

}



apiRouter.get('/', function(req, res){
	res.json({message: 'Welcome to the API'});
});

apiRouter.post('/registerNewUser', function(req,res){
	// this function will create a new user;
	// it will either confirm the user was created 
	// or it will spit back an error 
	console.log(req.body)
	User.findOne({
		username: req.body.name
	}, function(err, user){
		if(err){
			throw(err)
		}
		if(user){
			res.json({message: 'user already exists'});
		}else{
			var newUser = new User();
			newUser.username = req.body.name
			newUser.password = createHash(req.body.pw)
			newUser.secrets = []
			newUser.token = null
			newUser.save(function(err){
				if(err){
					console.log('Db save problem');
					throw(err)
				}
				console.log('User saved correctly');
				res.json({message: 'created user'});
			})
		}
	})

});

apiRouter.post('/getNewKey', function(req,res){
	User.findOne({
		username: req.body.name
	}, function(err, user){
		if(err){
			throw(err)
			res.json({success: "Failed", message: "DB Error try again"})
		}
		if(!user){
			res.json({message: 'Username or Password Incorrect'});
		}
		if(!isValidPassword(user, req.body.pw)){
			res.json({message: 'Username or Password Incorrect'});
		}else{
			var token = jwt.sign({user: user.username}, config.secret)
			user.token = token 
			user.save(function(err){
				if(err){
					throw(err)
				}
				res.json({ success: "successful",
					      Message:'Your new key is:',
						  Token: token});
			})
		}
	})

});


apiRouter.post('/newSecret', tokenVerify, function(req,res){
	User.findOne({
		username: req.username 
	}, function(err, user){
		if(err){
			throw(err)
			res.json({success: "Failed", message: "DB Error try again"})
		}if(user){

		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})

});

apiRouter.get('/getAllSecrets', tokenVerify, function(req,res){
	User.findOne({
		username: req.username 
	}, function(err, user){
		if(err){
			throw(err)
			res.json({success: "Failed", message: "DB Error try again"})
		}if(user){

		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})
});

apiRouter.get('/getSpecificSecret', tokenVerify, function(req, res){
	User.findOne({
		username: req.username 
	}, function(err, user){
		if(err){
			throw(err)
 			res.json({success: "Failed", message: "DB Error try again"})
		}if(user){

		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})
});

apiRouter.post('/changeSecret', tokenVerify, function(req,res){
	User.findOne({
		username: req.username 
	}, function(err, user){
		if(err){
			throw(err)
		}if(user){

		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})
});

apiRouter.post('/deleteSecret',  tokenVerify, function(req,res){
	User.findOne({
		username: req.username 
	}, function(err, user){
		if(err){
			throw(err)
		}if(user){

		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})
});


app.use(apiRouter);

server = https.createServer(server_options, app); 
server.listen(8443);

