const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let items = [];
function Item(name,description){
	this.name = name;
	this.description = description;
}
items.push( new Item('coin','a golden coin') );
items.push( new Item('sword','a long iron sword') );
items.push( new Item('apple','a red fruit') );

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
    io.emit('theItems', JSON.stringify(items));
  //console.log(socket.id); 
    
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
       let words = msg.split(' ');
    if (words[0]=='create'){
    	items.push( new Item(words[1],'some description') );
    	io.emit('theItems', JSON.stringify(items)); // refresh the list of items
    }
      
    if (words[0]=='remove'){
    	let indexToRemove = items.findIndex((elem)=>elem.name==words[1]);
    	console.log( items,indexToRemove );
    	if (indexToRemove!=-1){
    		items.splice(indexToRemove,1);
    		io.emit('theItems', JSON.stringify(items)); // refresh the list of items
    	} else {
    		io.emit('chat message', 'Could not remove '+words[1]+'!'); 
    	}
    }
  });
    
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});