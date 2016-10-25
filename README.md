#Task

This is an API created in Node.js to store user secrets.

The API has the ability to generate user accounts, create API tokens for those user accounts (just a simple JWT), and then create, read, update, and delete secrets unique to the users. 

##How is this accomplished? 
For the sake of time and rapid prototyping I settled on mongoDB, Express and Node.js. 

I create user accounts through an API call that does a simple verification of the user (and encrypt the passwords, of course). 
Accounts can then create API-tokens via the get api-token request. These api tokens can be used to prevent the user from having to enter and verify a password every time. Everytime a user generates a new API-token, their previous API token will be invalid for trying to access their information. 

Users can then submit secrets. Only a user with a valid token for that user account can see the secrets for that user account. 
Those secrets are stored in an array. Many secrets can be added, secrets can also be modified, or delted. 


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
| POST       | /registerNewUser  | NAME: string, PASSWORD: String | 






##Testing Methodology 


##Deployment 








##What I wish I had time for!

###CODE CLEANUP: 
A huge Server.js file is bad form, I could've split up a lot of the code into smaller more readable files with some extra time.
Additionally, pulling more shared code out into middleware (specifically looking for a specific secret has a lot of shared code). 
I should have made that it's own middleware, but I did not properly design the code at first to make it easy to pull out. 

###Write automated tests!
 So far my tests have been limited to trying to create edge-cases in Postman. 
Due to the limited amount of time I had to work on the API, I didn't bother to write good unit tests.
As a result, there may be some overlooked errors in the API, but the API should function as expected otherwise. 

###Properly encrypting secrets
Properly encrypting the user secrets. I overlooked encrypting user secrets and did not create a good method of doing so. 
I could've done it similar to passwords, but I felt there might be a better way to do it. 

###better modifying/searching
Right now I rely on the index of the string in my array. I could've implemented a way to query by terms in the secret strings to be modified. I also could've implemented a mass modify, or mass delete; I did not.


###Questionable things/ Bad practice
I've included a self generated cert and key in this repositiory. Generally that's terrible practice. 
I've also included a way to access the remote mongoDB I've provisioned for this assignment. Again, terrible practice 