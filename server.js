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
console.log("try to connect")
mongoose.connect(config.database);
console.log("weve connected")
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
				console.log(decoded)
				User.findOne({
					username: decoded.user,
					token: token }, function(err,user){
						if(err){
							throw(err)
						}if(!user){
							return res.json({message: "Token is invalid"})
						}
						req.username = decoded.user // the decoded JWT contains the username 
						return next();
					});
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
			newUser.secrets = new Array()
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
			console.log(user.secrets)
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
	console.log('Dis a new secret')
	console.log(req.username)
	User.findOne({
		username: req.username 
	}, function(err, user){
		console.log("hi")
		if(err){
			throw(err)
			res.json({success: "Failed", message: "DB Error try again"})
		}if(user){
			if(!req.body.secret){
				res.json({success: "Failed", message: "Submit a secret"})
			}else{
				if(typeof(user.secrets == Object)){
					user.secrets.push(req.body.secret)
					user.save()
					res.json({sucess: "Successful", message: "Your secret has been added"})
				}
			}

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
			res.json({success: "Successful", message: user.secrets})
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
			secretNumStr = req.headers["x-secret-num"]
			if(!secretNumStr|| parseInt(secretNumStr) === NaN
				|| user.secrets[parseInt(secretNumStr)] == null){
				res.json({success: "Failed", message: "Provide a valid index of the secret you want to see"})
			}else{
				res.json({success: "Successful", message: user.secrets[parseInt(secretNumStr)]})
			}
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
			secretNumStr = req.headers["x-secret-num"] || req.body.secretNum
			if(!secretNumStr|| parseInt(secretNumStr) === NaN
				|| user.secrets[parseInt(secretNumStr)] == null){
				res.json({success: "Failed", message: "Provide a valid index of the secret you want to modify"})
			}else{
				newSecret = req.headers["new-secret"] || req.body.newSecret;
				if(!newSecret){
					res.json({success: "Failed", message: "Provide a new secret please."})
				}else{
				user.secrets[parseInt(secretNumStr)] = newSecret
				user.save()
				res.json({success: "Successful", message: "your secret has been chaged to:" + user.secrets[parseInt(secretNumStr)]})
				}
			}

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
			secretNumStr = req.headers["x-secret-num"] || req.body.secretNum
			if(!secretNumStr|| parseInt(secretNumStr) === NaN
				|| user.secrets[parseInt(secretNumStr)] == null){
				res.json({success: "Failed", message: "Provide a valid index of the secret you want to delete"})
			}else{
				user.secrets.splice(parseInt(secretNumStr), 1) // the 1 here just says remove 1 element 
				user.save()
				res.json({success: "Successful", message: "Your secret has been deleted"})
			}
		}else{
			Console.log("must be something weird")
			res.json({success: 'Failed', message: 'Could not find your account, generate a new token'})
		}
	})
});


app.use(apiRouter);

server = https.createServer(server_options, app); 
server.listen(8443);

