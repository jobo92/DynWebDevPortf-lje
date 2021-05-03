//initialisere express
const express = require('express');
const app = express();
const http = require('http');
//ny variabel server, som bruger vores http til at lave en server
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const url = require('url');
const path = require('path');
const root = __dirname;

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

app.get('/', (req, res) => {
	res.sendFile(__dirname+'/public' + '/Task2.html');
});

io.on('connection', (socket) => {
     console.log('a user connected');
    io.emit('theItems', JSON.stringify(items));

    
    socket.on('updateUserAndRoomInventory', function(msg){
          console.log('reqitems'+ msg);
        io.emit('reqItems', JSON.stringify(items));
    });
    
//});
	 
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
        });
   
    socket.on('requestRoomItems', function(location){
       // let roomLocation = JSON.parse(location);
        let roomLocation = location;
        console.log('requestRoomItems '+ roomLocation);

            if (roomLocation== "corridor"){
                console.log("sending " + roomLocation +"itmes" );
                io.emit('recivedRoomItems', JSON.stringify(corridor));
                }

        else if (roomLocation == "livingroom"){
                console.log("sending " + roomLocation +"itmes" );
                io.emit('recivedRoomItems', JSON.stringify(livingroom));
                }

        else if (roomLocation == "basement"){
                console.log("sending " + roomLocation +"itmes" );
                io.emit('recivedRoomItems', JSON.stringify(basement));
                }

        else if (roomLocation == "upperfloor"){
                console.log("sending " + roomLocation +"itmes" );
                io.emit('recivedRoomItems', JSON.stringify(upperfloor));
                }

        else {console.log("nothing found");}

        });
    
    socket.on('addUserItem', function(itemName,location){
        let addItem = itemName;
        let userLocation =location; 
    

        console.log("user location " + userLocation);

        if (userLocation == "corridor"){
            console.log('removed item from '+ corridor + " itmes");
            let indexToRemove = corridor.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );
            if (indexToRemove!=-1){
                console.log('add items '+ addItem + " to user items");
            userItems.push( new UserItem(addItem) );
                corridor.splice(indexToRemove,1);
                console.log("sending user items" + userItems);
                io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
                io.emit('recivedRoomItems', JSON.stringify(corridor));
            }
        // refresh the list of room item
        }
    
        else if (userLocation == "livingroom"){
            console.log('removed item from '+ livingroom + " itmes");
            let indexToRemove = livingroom.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );
            if (indexToRemove!=-1){
                console.log('add items '+ addItem + " to user items");
        userItems.push( new UserItem(addItem) );
                livingroom.splice(indexToRemove,1);
            }
            console.log("sending user items" + userItems);
            io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
            io.emit('recivedRoomItems', JSON.stringify(livingroom));// refresh the list of room item
        }
    
         else if (userLocation == "basement"){
            console.log('removed item from '+ basement + " itmes");
            let indexToRemove = basement.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );
            if (indexToRemove!=-1){
                basement.splice(indexToRemove,1);
                console.log('add items '+ addItem + " to user items");
        userItems.push( new UserItem(addItem) );
            }
            console.log("sending user items" + userItems);
            io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
            io.emit('recivedRoomItems', JSON.stringify(basement));// refresh the list of room item
        }

        else if (userLocation == "upperfloor"){
            console.log('removed item from '+ upperfloor + " itmes");
            let indexToRemove = upperfloor.findIndex((elem)=>elem.name==addItem);
            console.log( addItem,indexToRemove );
            if (indexToRemove!=-1){
                upperfloor.splice(indexToRemove,1);
                console.log('add items '+ addItem + " to user items");
        userItems.push( new UserItem(addItem) );
            }
            console.log("sending user items" + userItems);
            io.emit('recivedUserItems', JSON.stringify(userItems));// refresh the list of user item
            io.emit('recivedRoomItems', JSON.stringify(upperfloor));// refresh the list of room item
        }
    });
    
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
        }

        else if (userLocation == "livingroom"){
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
        }

        else if (userLocation == "basement"){
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
        }

        else if (userLocation == "upperfloor"){
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
            }
    });
});

// route.for("GET","/", function(request,response){
// 	serverStatic(response,"public/Task1.html");
//     //serverStatic(response,"public/index.html");
// });
// serving static files - end
app.post('/', (req,res)=>{
	console.log('adding to the todo list...');

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