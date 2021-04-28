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
	res.sendFile(__dirname+'/public' + '/Task1.html');
});

io.on('connection', (socket) => {
	socket.on('chat message', (msg) => {
	  console.log('message: ' + msg);
	  io.emit('chat message', msg);
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