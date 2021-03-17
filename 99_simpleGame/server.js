const http = require('http');
const url = require('url');
const path = require('path');
const root = __dirname;

// *** load data from local file  ***
const fs = require('fs');
let myData = null;

fs.readFile('highscore.txt', function (err, data) {
	myData = []; // if file does not exist 
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
route.for("GET","/jquery-3.3.1.min.js", function(request,response){
	serverStatic(response,"public/jquery-3.3.1.min.js");
});

route.for("GET","/", function(request,response){
	serverStatic(response,"public/simpleGame_v2.html");
    //serverStatic(response,"public/index.html");
});
// serving static files - end


route.for("POST","/", function(request,response){
	console.log('adding to the todo list...');

	let store = '';
    request.on('data', function(data){
        store += data;
    });
    request.on('end', function(){ 
		let receivedObj = JSON.parse(store);
		console.log('received: '+ JSON.stringify( store ) );	// debug
		console.log("test revived data " +store+ " " + receivedObj.bestScore );
		// add new todo item to the list...
        
            console.log ("array length " + myData.length);
        let usernameNotFound = false;
        for (i =0; i< myData.length;i++)
            {
                console.log ("array length2 " + myData.length);// cckes if the user allready has a highsocre and if the new score is bigger
                if ( myData[i].username == receivedObj.username)
                    {
                         usernameNotFound = false;
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
                else if (typeof receivedObj.username !== 'undefined') // checking if has data and addig new user to highscore
                {
                    
                    console.log (receivedObj +(' ')+ receivedObj.username);
                    console.log("Adding new user to highscore: " + myData[i].username +" Score: " + myData[i].bestScore);
                    usernameNotFound = true;
                    break;// so it does not loop for ever
                    
                }
            }
        if (usernameNotFound == true)
            {
                //myData[].username = receivedObj.username;
                //myData[i].bestScore = receivedObj.bestScore;
                myData.push({username: receivedObj.username, bestScore: receivedObj.bestScore});
                usernameNotFound =false;
            }
		

		// then save the list on the file...
		fs.writeFile('highscore.txt', JSON.stringify(myData) ,  function(err) {
			if (err) {
				return console.error(err);
			}
			console.log("Data written successfully!");
		});
		
        response.setHeader("Content-Type", "text/json");
        response.end( JSON.stringify( myData ) );
        console.log('sent: '+ JSON.stringify( myData ) );	// debug
    });
	
});

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

http.createServer( onRequest ).listen(9999);
console.log("Server has started...");
