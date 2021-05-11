//initialisere express
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
//ny variabel server, som bruger vores http til at lave en server
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const url = require('url');
const path = require('path');
const root = __dirname;

// Adds all mongoose variables that are needed
const mongoose = require('mongoose');
const Room = require('./Room.model');
const User = require('./User.model');
const config = { useNewUrlParser: true, useUnifiedTopology: true };
const URI = process.env.MONGODB_URI || 'mongodb://localhost/myUniqueDB';
mongoose.connect(URI, config);
const db = mongoose.connection;


// Standard template which database will use
let rooms = [
    {name: "CORRIDOR", items: ["Icecream", "Potato"]},
    {name: "LIVINGROOM", items: ["Ice", "Chips"]},
    {name: "BASEMENT", items: ["Soda", "Axe"]},
    {name: "UPPERFLOOR", items: ["Toy", "Ak47"]}
]

let usernameDB= [
    {username: "admin", password: "admin", items: ["Ice","chips"], highscore:1000}
]


// cd C:\Users\Daniel Rose\Documents\GitHub Repositories\DynWebDevPortf-lje\Task2Mathias
// "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath data
// node server.js

// Function to create schema values, by using the array "rooms"
const createData = async () => {
    try {
        const results = await Room.create(rooms)
        const usernameresults = await User.create(usernameDB);
        console.log(results, usernameresults)
    } catch(err) {
        console.log(error)
    }
}

// Function to find and return all values within "Room" collection in database
const findAllRooms = async () => {
    const results = await Room.find({});
    //console.log("Found all these results: ");
    //console.log(results);
    return results
}

const findAllUsers = async () => {
    const results = await User.find({});
    //console.log("Found all these results: ");
    console.log(results);
    return results
}

// Function to find items in rooms based on the name of the room then return the room document
const findItemsByRoomName = async (namePara) => {
    let results = await Room.find({ name: namePara });
    console.log("In the room: " + namePara + " you can find these items:");
    //results.forEach(element => console.log(element.items));
    
    if (results[0] != undefined) {
        console.log(results[0].items);
        return results
    } else {
        console.log("Could not find any items :(");
        return
    } 
}

const findItemsByUserName = async (namePara) => {
    let results = await User.find({ username: namePara });
    console.log("In the room: " + namePara + " you can find these items:");
    //results.forEach(element => console.log(element.items));
    
    if (results[0] != undefined) {
        console.log(results[0].items);
        return results
    } else {
        console.log("Could not find any items :(");
        return
    } 
}

// Function to update the items in specific room
const updateItemsInRoom = async (gotID, arrayItems) => {
    let results = await Room.updateOne({ _id: gotID }, { items: arrayItems });
    console.log(results);
    return
}

const updateItemsInUser = async (gotID, arrayItems) => {
    let results = await User.updateOne({ _id: gotID }, { items: arrayItems });
    console.log(results);
    return
}


// Function to clear all data within the database
const deleteAll = async () => {
    await Room.deleteMany({});
    await User.deleteMany({});
}

// Function to convert first letter of a string to uppercase (used in database items handling)
function capFirst(str) {

    let smallstr = str.toLowerCase();
    // converting first letter to uppercase
    const capitalized = smallstr.charAt(0).toUpperCase() + smallstr.slice(1);

    return capitalized;
}

var highscoreUser;

//username and password section
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
	secret: 'ssshhhhh',
	resave: false,			// default value
    saveUninitialized: true // default value
    /* see https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session */
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/',(req,res)=>{
	let sess=req.session;
	//Session set when user Request our app via URL
	if(sess.email){
		/*
		* This line check Session existence.
		* If it existed will do some action.
		*/
		//res.redirect('/admin');
        res.redirect('/main');
	}
	else{
		res.render('index.html',{title:'Login Page'});
	}
});

let users = {
	'xxx':'123',
	'abc':'blabla',
	'gru':'shrikingmoon'
};

let userId =-1;
let currentUsers=[];
function AddToCurrentUsers(username){
	this.name = username;
}


//bruges dette?
let validate = require('./userList.js');
console.log( 'validate? ' , validate('xxx','123') );
console.log( 'validate? ' , validate('asfasgsdfg','asdfasdfsdf') );
console.log( 'validate? ' , validate('xxx','12345') );


app.post('/login',(req,res)=>{
	let sess=req.session;
	// We assign email and password to sess.email and sess.pswd variables.
	// The data comes from the submitted HTML page.
	sess.email=req.body.email;
	sess.pswd=req.body.pass;
	console.log('User submitted this data:',sess);

	let result = 'notCorrect';
	let p = users[sess.email];
    highscoreUser = sess.email;
	if (p){
		if (p==sess.pswd){
			// OK
			result = 'everythingOK';
		}
	}
	res.end( result );

});

//checking if the user is logged in 
app.get('/main',(req,res)=>{
	let sess=req.session;
	if(sess.email){
        //currentUser = sess.email;
        currentUsers.push(new AddToCurrentUsers(sess.email));
		res.sendFile(__dirname+'/public' + '/Task2.html');
	} else{
		res.write('<h1>Please login first.</h1>');
		res.end('<a href="/">Login</a>');
	}
});

//write logout in the browser to logout
app.get('/logout',(req,res)=>{
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

////End of username and password section

let items = [];

function Item(name,description){
	this.name = name;
	this.description = description;
}
items.push( new Item('coin','a golden coin') );
items.push( new Item('sword','a long iron sword') );
items.push( new Item('apple','a red fruit') );


let corridor =[];
function CorridorItems(name){
	this.name = name;
}
corridor.push( new CorridorItems('picture') );
corridor.push( new CorridorItems('broom') );

let upperfloor =[];
function UpperFloorItems(name){
	this.name = name;
}
upperfloor.push( new UpperFloorItems('pillow') );
upperfloor.push( new UpperFloorItems('box') );

let livingroom =[];
function LivingRoomItems(name){
	this.name = name;
}
livingroom.push( new LivingRoomItems('plate') );
livingroom.push( new LivingRoomItems('charger') );

let basement =[];
function BasementItems(name){
	this.name = name;
}
basement.push( new BasementItems('iron') );
basement.push( new BasementItems('paper') );

let userItems = [];
function UserItem(name){
	this.name = name;
}


// *** load data from local file  ***
const fs = require('fs');
const { exit } = require('process');
const { find } = require('./Room.model');
let myData = null;

fs.readFile('highscore.txt', function (err, data) {
	myData = []; // iff file does not exist 
		//                  -> first run 
		//                     create an empty array
	if (err) {		
		return; //console.error(err);
	} else {
		myData = JSON.parse(data);
	}
});
// *** ***


const serverStatic = function(response,file){
	let fileToServe = path.join(root,file);
	let stream = fs.createReadStream(fileToServe);

	stream.on('data',function(chunk){
		response.write(chunk);
	});
	stream.on('end',function(){
		response.end();
	});
};

// ======================================

let route = {
	routes : {},
	for: function(method,path,handler){  // HTTP methods
		this.routes[method+path] = handler;
	}
}

// serving static files - begin
// route.for("GET","/jquery-3.3.1.min.js", function(request,response){
// 	serverStatic(response,"public/jquery-3.3.1.min.js");
// });
app.get('/jquery-3.3.1.min.js', (req, res) => {
	res.sendFile(__dirname+'/public' + '/jquery-3.3.1.min.js');
});

//does not work after password impementation
/*app.get('/main', (req, res) => {
	res.sendFile(__dirname+'/public' + '/Task2.html');
});*/




// Start of io connection
io.on('connection', (socket) => {

    findAllRooms().then( function(value) {
        value.forEach(function(element) {
            io.emit('theItems', JSON.stringify(element.items), capFirst(element.name));
        });
    });
    
    console.log('a user connected');
    io.emit('theItems', JSON.stringify(items));
    
    // socket.on('Username', function(){
    //     userId= userId+1;
    //     console.log("user num"+ userId);
    //     console.log('sendig Username'+ currentUsers[userId].name);
    //     socket.emit('recivedUsername', JSON.stringify(currentUsers[userId].name));
    // }); // End of socket.on
    


    socket.on('updateUserAndRoomInventory', function(msg){
        console.log('reqitems'+ msg);
        io.emit('reqItems', JSON.stringify(items));
    }); // End of socket.on

    socket.on('testButton', function(){
        findItemsByUserName("admin").then( function(results){
            console.log(results[0].items);
            let id = results[0]._id;
            let newItems = ["kakao","malk"];

            updateItemsInUser(id,newItems);
        });
       
    }); // End of socket.on

    //laves når vi har databasen klar---------------------------------------------------
    // socket.on('highscoreUsername', function(){
    //     socket.emit('receivedUsername', JSON.stringify(highscoreUser));
    // })
	 


    socket.on('chat message', function(msg){
        console.log('message: ' + msg);

        let words = msg.split(' ');
        console.log (words);
        if (words[1]=='create'){
            items.push( new Item(words[2],'some description') );
            io.emit('theItems', JSON.stringify(items)); // refresh the list of items
        }

        if (words[1]=='remove'){
            let indexToRemove = items.findIndex((elem)=>elem.name==words[2]);
            console.log( items,indexToRemove );
            if (indexToRemove!=-1){
                items.splice(indexToRemove,1);
                io.emit('theItems', JSON.stringify(items)); // refresh the list of items
            } else {
                io.emit('chat message', 'Could not remove '+words[2]+'!'); 
            }
        }
        io.emit('chat message', msg);
    }); // End of socket.on

   

    // When requested by the client, the sever finds items in the specified room from the database, and emits them back to client
    socket.on('requestRoomItems', function(location){
        let capLoc = location.toUpperCase();
        findItemsByRoomName(capLoc).then( function(value) {
            if (value != undefined) {
                socket.emit('receivedRoomItems', JSON.stringify(value[0].items));
            } else { console.log("Could not find location :(") }
        }); // End of then()
    }); // End of socket.on
    

    // When the server gets the reset call it will reset the database and send out the newly created items
    socket.on('resetDatabase', function(location){
        let capLoc = location.toUpperCase();

        deleteAll().then( function() {
            createData().then( function() {
                findItemsByRoomName(capLoc).then( function(value) {
                    if (value != undefined) {
                        socket.emit('receivedRoomItems', JSON.stringify(value[0].items), value[0].name);
                    } else { console.log("Could not find location :(") }
                    findAllRooms().then( function(value) {
                        value.forEach(function(element) {
                            io.emit('theItems', JSON.stringify(element.items), capFirst(element.name));
                            
                        });
                        findAllUsers();
                    })
                })
            })
        });
    }); // End of socket.on
    


    // When "commanded" by client the server will add or remove items from specified room
    socket.on('command', function(msg){
        
        if (msg == null) return;
        let messageArray = msg.toUpperCase().split(" ");
        //console.log(messageArray);

        if (messageArray[0] == "IN") {

            findItemsByRoomName(messageArray[1]).then( function(value) {
                if (value != undefined) {

                    let items = value[0].items;
                    let id = value[0].id;
                    let name = value[0].name;

                    if (messageArray[2] == "ADD") {
                        if (messageArray[3] != undefined) items.push(capFirst(messageArray[3]));
                        //socket.emit('receivedRoomItems', JSON.stringify(items), name);
                        updateItemsInRoom(id, items).then( function() {
                            io.emit('theItems', JSON.stringify(items), capFirst(name));
                            findItemsByRoomName(messageArray[1]);
                        });

                    } else if (messageArray[2] == "REMOVE") {

                        const index = items.indexOf(capFirst(messageArray[3])); 
                        if (index > -1) { 
                            items.splice(index, 1); 
                        }

                        //socket.emit('receivedRoomItems', JSON.stringify(items), name);
                        updateItemsInRoom(id, items).then( function() {
                            io.emit('theItems', JSON.stringify(items), capFirst(name));
                            findItemsByRoomName(messageArray[1]);
                        });
                    }
                } // End if if (value != undefined)

            }); // End of then()

        } // End of if (messageArray[0] == "IN")

    }); // End of socket.on('command')





    socket.on('addUserItem', function(itemName,user,location){
        let addItem = itemName;
        let theUser = user;
        let userLocation = location; 

        findItemsByRoomName(userLocation).then(function(results){
        let newItems = results[0].items;
        let id = results[0]._id;

        const index = newItems.indexOf(addItem); 
                        if (index > -1) { 
                            newItems.splice(index, 1);
                            updateItemsInRoom(id,newItems).then(function(){
                                
                                findItemsByUserName(theUser).then(function(results){
                                    let userId = results[0]._id;
                                    let userItems = results[0].items;
                                    userItems.push(addItem);
                                    io.emit('theItems',JSON.stringify(userItems));
                                    // console.log("useritems: "+ Array.isArray(userItems));
                                    // console.log(userItems);
                                    updateItemsInUser(userId,userItems).then(function(){
                                        findAllUsers();
                                    });
                                    
                                 });
                            });
                        }
        });

    }); // End of socket.on
    

        // console.log("user location " + userLocation);

        // if (userLocation == "corridor"){
        //     console.log('removed item from '+ corridor + " items");
        //     let indexToRemove = corridor.findIndex((elem)=>elem.name==addItem);
        //     console.log( addItem,indexToRemove );
            
        //     if (indexToRemove!=-1){
        //         console.log('add items '+ addItem + " to user items");
        //         userItems.push( new UserItem(addItem) );
        //         corridor.splice(indexToRemove,1);
        //         console.log("sending user items" + userItems);
        //         io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
        //         io.emit('receivedRoomItems', JSON.stringify(corridor));
        //     }
        // // refresh the list of room item
        // } else if (userLocation == "livingroom"){
        //     console.log('removed item from '+ livingroom + " items");
        //     let indexToRemove = livingroom.findIndex((elem)=>elem.name==addItem);
        //     console.log( addItem,indexToRemove );
            
        //     if (indexToRemove!=-1){
        //         console.log('add items '+ addItem + " to user items");
        //         userItems.push( new UserItem(addItem) );
        //         livingroom.splice(indexToRemove,1);
        //     }
            
        //     console.log("sending user items" + userItems);
        //     io.emit('recivedUserItems', JSON.stringify(userItems)); // refresh the list of user item
        //     io.emit('receivedRoomItems', JSON.stringify(livingroom)); // refresh the list of room item

        // } else if (userLocation == "basement"){
        //     console.log('removed item from '+ basement + " items");
        //     let indexToRemove = basement.findIndex((elem)=>elem.name==addItem);
        //     console.log( addItem,indexToRemove );

        //     if (indexToRemove!=-1){
        //         basement.splice(indexToRemove,1);
        //         console.log('add items '+ addItem + " to user items");
        //         userItems.push( new UserItem(addItem) );
        //     }
            
        //     console.log("sending user items" + userItems);
        //     io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
        //     io.emit('receivedRoomItems', JSON.stringify(basement));// refresh the list of room item

        // } else if (userLocation == "upperfloor"){
        //     console.log('removed item from '+ upperfloor + " items");
        //     let indexToRemove = upperfloor.findIndex((elem)=>elem.name==addItem);
        //     console.log( addItem,indexToRemove );

        //     if (indexToRemove!=-1){
        //         upperfloor.splice(indexToRemove,1);
        //         console.log('add items '+ addItem + " to user items");
        //         userItems.push( new UserItem(addItem) );
        //     }
        //     console.log("sending user items" + userItems);
        //     io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
        //     io.emit('receivedRoomItems', JSON.stringify(upperfloor));// refresh the list of room item
        // }
    

    

    socket.on('removeUserItems', function(itemName,location){
        let addItem = itemName;
        let userLocation =location; 
        console.log('add items '+ addItem + " to room items");


        console.log("user location " + userLocation);

        if (userLocation == "corridor"){
            console.log('removed item from user '+ " items");
            let indexToRemove = userItems.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );

            if (indexToRemove!=-1){
                console.log('add items to corridor room items');
                corridor.push( new UserItem(addItem) );
                userItems.splice(indexToRemove,1);
                console.log("sending user items" + userItems);
                io.emit('recivedRemovedUserItems', JSON.stringify(userItems));// refresh the list of user item
                io.emit('recivedAddedRoomItems', JSON.stringify(corridor));// refresh the list of room item
            }

        } else if (userLocation == "livingroom"){
            console.log('add items '+ " to this room items");
            console.log('removed item from '+ livingroom + " itmes");
            let indexToRemove = userItems.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );

            if (indexToRemove!=-1){
                livingroom.push( new UserItem(addItem) );
                userItems.splice(indexToRemove,1);
                console.log("sending user items" + userItems);
                io.emit('recivedRemovedUserItems', JSON.stringify(userItems));// refresh the list of user item
                io.emit('recivedAddedRoomItems', JSON.stringify(livingroom));// refresh the list of room item
            }

        } else if (userLocation == "basement"){
            console.log('add items '+ addItem + " to this room items");
            console.log('removed item from '+ basement + " itmes");
            let indexToRemove = userItems.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );

            if (indexToRemove!=-1){
                basement.push( new UserItem(addItem) );
                userItems.splice(indexToRemove,1);
                console.log("sending user items" + userItems);
                io.emit('recivedRemovedUserItems', JSON.stringify(userItems));// refresh the list of user item
                io.emit('recivedAddedRoomItems', JSON.stringify(basement));// refresh the list of room item
            }
            
        } else if (userLocation == "upperfloor"){
            console.log('add items '+ addItem + " to this room items");
            console.log('removed item from '+ upperfloor + " itmes");
            let indexToRemove = userItems.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );

            if (indexToRemove!=-1){
                upperfloor.push( new UserItem(addItem) );
                userItems.splice(indexToRemove,1);
                 console.log("sending user items" + userItems);
                io.emit('recivedRemovedUserItems', JSON.stringify(userItems));// refresh the list of user item
                io.emit('recivedAddedRoomItems', JSON.stringify(upperfloor));// refresh the list of room item
            }

        } // End of if (userLocation == "corridor")
        
    }); // End of socket.on

}); // End of io.on('connection')












// route.for("GET","/", function(request,response){
// 	serverStatic(response,"public/Task1.html");
//     //serverStatic(response,"public/index.html");
// });
// serving static files - end
app.post('/', (req,res)=>{
	

	let store = '';
    req.on('data', function(data){
        store += data;
    });
    req.on('end', function(){ 
		let receivedObj = JSON.parse(store);
		console.log('received: '+ JSON.stringify( store ) );	// debug
		console.log("test revived data " +store+ " " + receivedObj.bestScore );
		// add new todo item to the list...
        
            console.log ("array length " + myData.length);
        let usernameFound = false;
        for (i =0; i< myData.length;i++)
            {
                console.log ("array length2 " + myData.length);// cckes if the user allready has a highsocre and if the new score is bigger
                if ( myData[i].username == receivedObj.username)
                    {
                         usernameFound = true;
                        if (receivedObj.bestScore > myData[i].bestScore)
                            {
                                myData[i].bestScore = receivedObj.bestScore;
                                console.log("highscore update with higher score");
                            }
                        else
                            {
                                console.log("score to low");
                            }
                    }
            }
        
        //Checker om der blev fundet username og hvis ikke tilføjes en ny score med det username
        if (usernameFound == false && receivedObj.username != undefined) {
            myData.push({username: receivedObj.username, bestScore: receivedObj.bestScore});
        }
		

		// then save the list on the file...
		fs.writeFile('highscore.txt', JSON.stringify(myData) ,  function(err) {
			if (err) {
				return console.error(err);
			}
			console.log("Data written successfully!");
		});
		
        res.setHeader("Content-Type", "text/json");
        res.end( JSON.stringify( myData ) );
        console.log('sent: '+ JSON.stringify( myData ) );	// debug
    });
});

// route.for("POST","/", function(request,response){
// 	console.log('adding to the todo list...');

// 	let store = '';
//     request.on('data', function(data){
//         store += data;
//     });
//     request.on('end', function(){ 
// 		let receivedObj = JSON.parse(store);
// 		console.log('received: '+ JSON.stringify( store ) );	// debug
// 		console.log("test revived data " +store+ " " + receivedObj.bestScore );
// 		// add new todo item to the list...
        
//             console.log ("array length " + myData.length);
//         let usernameFound = false;
//         for (i =0; i< myData.length;i++)
//             {
//                 console.log ("array length2 " + myData.length);// cckes if the user allready has a highsocre and if the new score is bigger
//                 if ( myData[i].username == receivedObj.username)
//                     {
//                          usernameFound = true;
//                         if (receivedObj.bestScore > myData[i].bestScore)
//                             {
//                                 myData[i].bestScore = receivedObj.bestScore;
//                                 console.log("highscore update with higher score");
//                             }
//                         else
//                             {
//                                 console.log("score to low");
//                             }
//                     }
//             }
        
//         //Checker om der blev fundet username og hvis ikke tilføjes en ny score med det username
//         if (usernameFound == false && receivedObj.username != undefined) {
//             myData.push({username: receivedObj.username, bestScore: receivedObj.bestScore});
//         }
		

// 		// then save the list on the file...
// 		fs.writeFile('highscore.txt', JSON.stringify(myData) ,  function(err) {
// 			if (err) {
// 				return console.error(err);
// 			}
// 			console.log("Data written successfully!");
// 		});
		
//         response.setHeader("Content-Type", "text/json");
//         response.end( JSON.stringify( myData ) );
//         console.log('sent: '+ JSON.stringify( myData ) );	// debug
//     });
	
// });

// ======================================

function onRequest(request,response){
	let pathname = url.parse(request.url).pathname;
	console.log("Request for "+request.method + pathname+" received.");
	
	// a switch statement
	if (typeof route.routes[request.method+pathname] === 'function'){
		route.routes[request.method+pathname](request,response);
	} else {
		response.writeHead(404,{"Content-Type":"text/plain"});
		response.end("Four-O-Four NOT FOUND :P"); // is like write+end
	}
}



server.listen(9999, () => {
	console.log('listening on *:9999');
});