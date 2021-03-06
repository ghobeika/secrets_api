#Task

This is an API created in Node.js to store user secrets.

The API has the ability to generate user accounts, create API tokens for those user accounts (just a simple JWT), and then create, read, update, and delete secrets unique to the users. 

##How is this accomplished? 
For the sake of time and rapid prototyping I settled on mongoDB, Express and Node.js. 

I create user accounts through an API call that does a simple verification of the user (and encrypt the passwords, of course). 
Accounts can then create API-tokens via the get api-token request. These api tokens can be used to prevent the user from having to enter and verify a password every time. Everytime a user generates a new API-token, their previous API token will be invalid for trying to access their information. 

Users can then submit secrets. Only a user with a valid token for that user account can see the secrets for that user account. 
Those secrets are stored in an array. Many secrets can be added, secrets can also be modified, or delted. 

All items are returned to the user as JSON.


##API Methods
GET: /    (this is just a welcome mesage)

POST: /registerNewUser

POST: /getNewKey

POST: /NewSecret 

GET: /getAllSecrets

GET: /getSpecificSecrets

POST: /changeSecret

POST: /deleteSecret

The POST requests support all fields being passed through in the body of the request.

The GET requuest expet all relevent fields be passed through the headers of the request.

###Methods broken down
|Request Type| Endpoint Name     | Params                         | Meaning               |
|------------|-------------------|--------------------------------|-----------------------|
| GET        | / (welcome)       | None                           | Just a welcome message| 
| POST       | /registerNewUser  | NAME: string, PW: string | Attempts to register a new user with username NAME, and password PW|
| POST       | /getNewKey        | NAME: string, PW: string | Generates an API token for the user to use from this point on |
| POST       | /NewSecret        | token: your token, secret:string| Given a valid token, adds a given secret to the user's secrets|
| GET        | /getAllSecrets    |x-access-token: your token| given a valid token, returns all secrets for that user |
| GET        | /getSpecificSecrets| x-acces-token: your token, x-secret-num: int index of secret.| Given a valid token and secret index, returns that secret| 
| POST       | /changeSecret     | token: your token, secretNum: int index of secret, newSecret: string| Given valid index and token, replaces secret with newSecret|
| POST       | /deleteSecret     | token: your token, secretNum: int index of secret| Given valid params deletes that index in secrets array| 







##Testing Methodology 

I did not have time to test this API robustly. 
What I did do was use postman to do the following: 

Break every endpoint, I tried to pass invalid values to each endpoint to see if it would break. 
Use every endpoint, I tried to pass valid values to eah endpoint to examine if it worked as expected.

I did these tests everytime an endpoint was added, and repeated the tests for each new endpoint added.

I then tried to access other user data, and use old tokens to acquire user data. 
IF I had more time, I would encapsulate these tests, and more unit/edgecase/datatype tests in a testing script.


##Deployment 

To install this file just run npm install in your root. 
Then run node server.js. 
The file should connect to my modulus DB for use. 
NOTE: To do SSL it is using self-signed certs, so you may get warnings. 
The api will be hosted at localhost:8443, all endpoints are just routes off /. 
You can use postman or well formed curl requests to test the API.

##A deployment 
NOTE: it is deployed at https://45.55.185.21 on port 443 as well
You can totally DDOS this server as there's no limit to how many accounts you can request. Please don't








##What I wish I had time for!
(I've only worked on this for )

###CODE CLEANUP: 
A huge Server.js file is bad form, I could've split up a lot of the code into smaller more readable files with some extra time.
Additionally, pulling more shared code out into middleware (specifically looking for a specific secret has a lot of shared code). 
I should have made that it's own middleware, but I did not properly design the code at first to make it easy to pull out. 

###Write automated tests!
 So far my tests have been limited to trying to create edge-cases in Postman. 
Due to the limited amount of time I had to work on the API, I didn't bother to write good unit tests.
As a result, there may be some overlooked errors in the API, but the API should function as expected otherwise. 

###Better error codes
There should be expected error codes back to the user for the API endpoints, right now there are just semi-descriptive error messages.

###Properly encrypting secrets
Properly encrypting the user secrets. I overlooked encrypting user secrets and did not create a good method of doing so. 
I could've done it similar to passwords, but I felt there might be a better way to do it. 

###better modifying/searching
Right now I rely on the index of the string in my array. I could've implemented a way to query by terms in the secret strings to be modified. I also could've implemented a mass modify, or mass delete; I did not.


###Questionable things/ Bad practice
I've included a self generated cert and key in this repositiory. Generally that's terrible practice. 
I've also included a way to access the remote mongoDB I've provisioned for this assignment. Again, terrible practice 
