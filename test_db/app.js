const app = require('express')();

const mongoose = require('mongoose');
const Room = require('./Room.model');

var http = require('http').Server(app);
var io = require('socket.io')(http);


// cd C:\Users\Daniel Rose\Desktop\Lecture 9\code\part2\test_db
// "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath data
// node app.js


const config = { useNewUrlParser: true, useUnifiedTopology: true };
const URI = process.env.MONGODB_URI || 'mongodb://localhost/myBookDB';
mongoose.connect(URI, config);
const db = mongoose.connection;

const port = 3000;

let rooms = [
    {name: "LIVING_ROOM", items: ["Ice Cream", "Potato"]},
    {name: "CORRIDOR", items: ["Ice Potato", "Chips"]},
    {name: "BASEMENT", items: ["Soda", "Axe"]},
    {name: "BOSS_ROOM", items: ["Toy", "Ak47"]}
]

// Function to create schema values, by using the array "rooms"
const createData = async () => {
    try {
        const results = await Room.create(rooms)
        console.log(results)
    } catch(err) {
        console.log(error)
    }
} // End of createData()

// Function to find and return all values within "Room" collection in database
const findAll = async () => {
    const results = await Room.find({});
    //console.log("Found all these results: ");
    //console.log(results);
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

// Function to update the items in specific room
const updateItemsInRoom = async (gotID, arrayItems) => {
    let results = await Room.updateOne({ _id: gotID }, { items: arrayItems });
    console.log(results);
    return
}

// Function to clear all data within the database
const deleteAll = async () => {
    await Room.deleteMany({});
}








// Function to convert first letter of a string to uppercase
function capFirst(str) {

    let smallstr = str.toLowerCase();
    // converting first letter to uppercase
    const capitalized = smallstr.charAt(0).toUpperCase() + smallstr.slice(1);

    return capitalized;
}








http.listen(port, function(){
    console.log("App listening on port: " + port);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// Io stuff in the following section
io.on('connection', function(socket){

    console.log("Start of io-connection")

    findAll().then( function(value) {
        value.forEach(function(element) {
            io.emit('theItems', JSON.stringify(element.items), capFirst(element.name));
        });
    });


    socket.on('command', function(msg){
        
        let messageArray = msg.toUpperCase().split(" ");
        console.log(messageArray);

        if (messageArray[0] == "IN") {

            findItemsByRoomName(messageArray[1]).then( function(value) {
                if (value != undefined) {

                    let items = value[0].items;
                    let id = value[0].id;
                    let name = value[0].name;

                    if (messageArray[2] == "ADD") {
                        if (messageArray[3] != undefined) items.push(capFirst(messageArray[3]));
                        updateItemsInRoom(id, items).then( function() {
                            io.emit('theItems', JSON.stringify(items), capFirst(name));
                            findItemsByRoomName(messageArray[1]);
                        });

                    } else if (messageArray[2] == "REMOVE") {

                        const index = items.indexOf(capFirst(messageArray[3])); 
                        if (index > -1) { 
                            items.splice(index, 1); 
                        }

                        updateItemsInRoom(id, items).then( function() {
                            io.emit('theItems', JSON.stringify(items), capFirst(name));
                            findItemsByRoomName(messageArray[1]);
                        });
                    }
                } // End if if (value != undefined)

            }); // End of then()

        } // End of if (messageArray[0] == "IN")

    }); // End of socket.on('command')

}); // End of io.on()



//deleteAll().then((value) => { createData(); });
//deleteAll();
//findAll();
//findItemsByRoomName("BOSS ROOM");
//closeDB();