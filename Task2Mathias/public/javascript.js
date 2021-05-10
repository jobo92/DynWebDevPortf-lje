$(document).ready(function() {
    
    // initial state of the game
    let state = {hp: 30, xp: 0, score: 0};
    let arrayHighScore = [];
    let username = "";
    let gameIsRunning = true;
    let chanceToFind = 15;
    
   
    var socket = io;
    socket.emit('Username'); 
    
    //console.log ("userid: " + userId);
    socket.on('recivedUsername', function(itemsString){
    let username = JSON.parse(itemsString);
    $('#userNameField').html("Welcome, your username is: " + username);                        
    });
    
    // Click function for command
    $('form').submit(function(e){
        e.preventDefault(); // Prevents page reloading
        let input = $('#formInput').val()
        socket.emit('command', input);
        $('#formInput').val('');
        return false;
    });

    
    // henter highscore liste og viser den på siden
    $.ajax({
          type: "POST",
          url: "http://localhost:9999/",
          dataType: "json",
          data: JSON.stringify({
                                })
        }).done(function ( data ) {
            console.log( data );
            //Her sætter vi arrayHighscore til at være lige med dataen. Vi kan derfor bruge arrayHighscore senere i programmet   
            arrayHighScore = data;
        // sorting highscore in decending order
        data.sort((a, b) => parseFloat(b.bestScore) - parseFloat(a.bestScore));
            
              showFirstHighscore();
            //$('#the_text').val('');
        inputUsername();
        });
    // the display that will show what happens
            // viserstart highscore
     function showFirstHighscore() {
         
         let elements = $();
            for(let i=0; i<arrayHighScore.length;i++) {
                elements = elements.add('<li>'+arrayHighScore[i].username + ': '+ arrayHighScore[i].bestScore +'</li>');
            }
            $('#highscore').empty();
            $('#highscore').append(elements);   
     }
    
    function updateHighscore() {
         let newUser = true;
        let addNewUser = true;
         let elements = $();
        
        
        for(let i=0; i<arrayHighScore.length;i++) {
                if (username == arrayHighScore[i].username)
                    {
                        addNewUser=false;
                   
                    }
                }
               
                if (addNewUser== true)
                    {
                        arrayHighScore.push({username: username, bestScore: state.score});
                      arrayHighScore.sort((a, b) => parseFloat(b.bestScore) - parseFloat(a.bestScore));
                    }
        
            for(let i=0; i<arrayHighScore.length;i++) {
                arrayHighScore.sort((a, b) => parseFloat(b.bestScore) - parseFloat(a.bestScore));
                if (username == arrayHighScore[i].username)
                    {
                        newUser=false;
                        if ( state.score > arrayHighScore[i].bestScore)
                        {
                            elements = elements.add('<li>'+username+ ': '+ state.score +'</li>');
                        }
                        else
                        {
                            elements = elements.add('<li>'+username+ ': '+ arrayHighScore[i].bestScore +'</li>');    
                        }
                    
                    }
                else{elements = elements.add('<li>'+arrayHighScore[i].username + ': '+ arrayHighScore[i].bestScore +'</li>');}
                
            }
                if (newUser== true)
                    {
                        elements = elements.add('<li>'+username+ ': '+ state.score +'</li>');
                    }
            $('#highscore').empty();
            $('#highscore').append(elements);   
     }
    
    
    //Funktion der "promter" efter dit brugernavn og checker om du har en highscore  
    function inputUsername() {
        username = prompt("Please enter your username");
        if (username != null) {
            $('#userNameField').html("Welcome, your username is: " + username);
        } 
       //Har en state af username, hvis username er i arrayHighscore, så laver den en div med din highscore 
       //Hvis vi ikke har username, så laver den en anden div med at du ikke har din highscore
       let stateOfUsername =false;
        for (i = 0; i < arrayHighScore.length; i++) 
        { 
            if (arrayHighScore[i].username == username) {
               stateOfUsername =true;
            }
            if (stateOfUsername == true)
            {
              $("#userNameField").after("<div id='hasHighScore'>You have a highscore of: " + arrayHighScore[i].bestScore+"</div>"); 
              break;
            }
        }
        if(stateOfUsername==false){
            $("#userNameField").after( "<div id='hasHighScore'> You don't have a highscore yet</div>" );  
        }
    } //End of inputUsername()



var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(e) {
e.preventDefault();
if (input.value) {
socket.emit('chat message', username+": " +input.value);
input.value = '';
}
});

//socket section 
// Getting the username from server 


socket.on('chat message', function(msg) {
var item = document.createElement('li');
item.textContent = msg;
messages.appendChild(item);
window.scrollTo(0, document.body.scrollHeight);
});


socket.on('theItems', function(itemsString, roomName){
let items = JSON.parse(itemsString);
console.log(items);
//console.log( items , items.map(it=>it.name).join('<br>') );
$('#' + roomName).empty();
$('#' + roomName).append(roomName);
items.forEach((elem) => {
  $('#' + roomName).append($('<li>').text(elem));
})
}); // End of socket.on('theItems')



    
/*socket.on('theItems', function(itemsString){
var items = JSON.parse(itemsString);
//console.log( items , items.map(it=>it.name).join('<br>') );
$('#itemList').empty();
$('#itemList').html("<h3>This is your list");
items.forEach((elem)=>{
$('#itemList').append($('<li id="YourItems"> ').text(elem.name));
//     while($("#itemList")!=0){
//     $('#itemList').on("click",function(){
//         $('#YourItems').hide();
//     //console.log(elem.name);
//     });

// };
});

});*/
    
/*socket.on('theItems', function(itemsString){
let items = JSON.parse(itemsString);
//console.log( items , items.map(it=>it.name).join('<br>') );
$('#itemList').empty();
items.forEach((elem)=>{
$('#itemList').append($('<li>').text(elem.name));
  })
}); */  
    
    
    //Klik funktion der sender "arrayHighScore" arrayet til node der gemmer det som en fil
   /* $('input:submit').on('click',function(evt){
        evt.preventDefault();
        
        console.log( 'submitting form with Ajax...' );
         $.ajax({
            type: "POST",
            url: "http://localhost:9999/",
            dataType: "json",
            data: JSON.stringify({username: username, bestScore: state.score})
        }).done(function ( data ) {
            console.log( data);
        })
      
    }); //End of $('input:submit')*/
    
    
    function quit(){
        updateHighscore();
        console.log('test' +state.score);
         $.ajax({
            type: "POST",
            url: "http://localhost:9999/",
            dataType: "json",
            data: JSON.stringify({username: username, bestScore: state.score})
        }).done(function ( data ) {
            console.log( data);
        })
    }
    
    
const status = $('#status')[0];
            // skal laves om
    $('#status').html('Your status is now: ' + JSON.stringify(state));
    //status.innerHTML = 'Your status is now: ' + JSON.stringify(state);
                    //`your hp is ${state.hp}, and ...`;
    // skal laves om
    const enterBtn = $('#enterBtn');	
    const userInput = $('#userInput');
    let WhereIsTheUser = "corridor";
    console.log("setting rom items");
    


    socket.emit('requestRoomItems',WhereIsTheUser);
    
    socket.on('recivedRoomItems', function(itemsString) {
        let items = JSON.parse(itemsString);
        console.log(items)
        //console.log( items , items.map(it=>it.name).join('<br>') );
        $('#itemsInRoom').empty();

        items.forEach((elem)=>{
            $('#itemsInRoom').append($('<li>').text(elem));
        });
    });


    
    function encounterMonster() {
        let dice = Math.floor(Math.random()*5)+1;
        if (dice <= 1) {
            let lostHp = Math.floor(Math.random()*6)+6;
            state.hp -= lostHp;
            state.xp += 10;
            state.score += 5;
            $('#status').append( '<br/>You spotted a monster in the room and decided to fight it');
            $('#status').append( '<br/>You lost ' + lostHp + ' hp');
            
        }
    }
    
    
    $('#enterBtn').click(function(){

        
        $('#formInput').val('');

        $('#status').html( 'Your status is now: ' + JSON.stringify(state));
        if (state.hp <=0)
            {
                $('#status').append( '<br/>You ran out of hp and died, most unfortunate :( ');
                quit();
            }else{

                let userInput2 = [];

               

                userInput2 = $('#userInput')[0].value.toUpperCase().split(" ");
                console.log(userInput2);
                //switch( $('#userInput')[0].value.toUpperCase() ){

                switch( userInput2[0]){

                
            case 'QUIT':{
                quit();
                break;
                
            } 
            
            case 'SEARCH':{
                let dice = Math.floor(Math.random()*chanceToFind)+1;
                if (dice<4) {
                    $('#status').append('<br/>You found a HP potion, your health increased');
                    chanceToFind+= 3;
                    state.hp += 6;
                    state.score += 1;
                    state.hp -= 1;
                    
                } else if (dice<7) {
                    $('#status').append('<br/>You found a piece of old parchement ... maybe it is worth something');
                    chanceToFind+=3;
                    state.score += 1;
                    state.hp -= 1;
                    
                } else if (dice<10) {
                    $('#status').append('<br/>You found an extra copy of the best manual in existence');
                    chanceToFind+=3;
                    state.score += 1;
                    state.hp -= 1;
                    
                } else if (dice<13) {
                    $('#status').append('<br/>You found something interesting ... it seems valuable but also very disturbing');
                    chanceToFind+=3;
                    state.score += Math.floor(Math.random()*6)+1;
                    state.hp -= 1;
                    
                } else if (dice<15) {
                    $('#status').append('<br/>You found a chicken ... yum');
                    chanceToFind+=3;
                    state.score += 1;
                    state.hp -= 1;
                    
                } else {
                    $('#status').append('<br/>You found nothing ...');
                    state.hp -= 1;
                }
            } 
                console.log(chanceToFind);
                break;
                
            case 'BASEMENT':{
                    if(WhereIsTheUser!="corridor"){ 
                        $('#status').append( '<br/>...command not recognized...');
                        break;
                    }
                
                    WhereIsTheUser="basement"
                    socket.emit('requestRoomItems',WhereIsTheUser);
                    socket.on('recivedRoomItems', function(itemsString)
                        {
                        let items = JSON.parse(itemsString);
                        //console.log( items , items.map(it=>it.name).join('<br>') );
                        $('#itemsInRoom').empty();
                        items.forEach((elem)=>{
                            $('#itemsInRoom').append($('<li>').text(elem));
                              })
                        });
                
                    encounterMonster();
                    
                    $('#status').append( '<br/>you are now in the basement');
                    $('#options').replaceWith('<b id="options" ><br/>your options are Search/corridor/Quit </b>');
                
                } break;
                        
            case 'LIVINGROOM':{
                    if(WhereIsTheUser!="corridor"){ 
                        $('#status').append( '<br/>...command not recognized...');
                        break;
                    }
                
                    WhereIsTheUser="livingroom"
                    socket.emit('requestRoomItems',WhereIsTheUser);
                    socket.on('recivedRoomItems', function(itemsString)
                        {
                        let items = JSON.parse(itemsString);
                        //console.log( items , items.map(it=>it.name).join('<br>') );
                        $('#itemsInRoom').empty();
                        items.forEach((elem)=>{
                            $('#itemsInRoom').append($('<li>').text(elem));
                              })
                        });    
                
                    encounterMonster();
                    
                    $('#status').append( '<br/>you are now in the livingroom');
                    $('#options').replaceWith('<b id="options" ><br/>your options are Search/corridor/Quit </b>');
                
                } break;
                        
            case 'UPPERFLOOR':{
                    if(WhereIsTheUser!="corridor"){ 
                        $('#status').append( '<br/>...command not recognized...');
                        break;
                    }
                
                    WhereIsTheUser="upperfloor"
                    socket.emit('requestRoomItems',WhereIsTheUser);
                    socket.on('recivedRoomItems', function(itemsString)
                        {
                        let items = JSON.parse(itemsString);
                        //console.log( items , items.map(it=>it.name).join('<br>') );
                        $('#itemsInRoom').empty();
                        items.forEach((elem)=>{
                            $('#itemsInRoom').append($('<li>').text(elem));
                              })
                        });
                        
                    encounterMonster();
                    
                    $('#status').append( '<br/>you are at the upperfloor');
                    $('#options').replaceWith('<b id="options" ><br/>your options are Search/corridor/Quit </b>');
                } break;
                        
            case 'CORRIDOR':{
                    if(WhereIsTheUser=="corridor"){ 
                        $('#status').append( '<br/>..You are in corriodor...');
                        break;
                    }
                    WhereIsTheUser="corridor";
                    socket.emit('requestRoomItems',WhereIsTheUser);
                    socket.on('recivedRoomItems', function(itemsString)
                        {
                        let items = JSON.parse(itemsString);
                        //console.log( items , items.map(it=>it.name).join('<br>') );
                        $('#itemsInRoom').empty();
                        items.forEach((elem)=>{
                            $('#itemsInRoom').append($('<li>').text(elem));
                              })
                        })
                    encounterMonster();
                    
                    $('#status').append( '<br/>you are at the corridor');
                    $('#options').replaceWith('<b id="options" ><br/>your options are Search/Basement/Livingroom/Upperfloor/Quit </b>');
            } break;
                        
        case 'PICKUP':{
                        if( userInput2[1] == 'PICTURE'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"picture", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'BROOM'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"broom", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                        
                       else if( userInput2[1] == 'PILLOW'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"pillow", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'BOX'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"box", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'PLATE'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"plate", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'CHARGER'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"charger", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'IRON'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"iron", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                        else if( userInput2[1] == 'PAPER'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('addUserItem',"paper", WhereIsTheUser);
                               
                                socket.on('recivedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                    }break;
                        
        case 'REMOVE':{
                    if( userInput2[1] == 'PICTURE'){
                                console.log(" user removed "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"picture", WhereIsTheUser);
                               
                                socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                   
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                 console.log(items);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'BROOM'){
                                    console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                    socket.emit('removeUserItems',"broom", WhereIsTheUser);
                               
                                    socket.on('recivedRemovedUserItems', function(itemsString){
                                    console.log("test");
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                        
                        else if( userInput2[1] == 'PILLOW'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"pillow", WhereIsTheUser);
                               
                                    socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                                    socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                        else if( userInput2[1] == 'BOX'){
                                    console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                    socket.emit('removeUserItems',"box", WhereIsTheUser);
                               
                                    socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                                    socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                    else if( userInput2[1] == 'PLATE'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"plate", WhereIsTheUser);
                               
                                socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                    else if( userInput2[1] == 'CHARGER'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"charger", WhereIsTheUser);
                               
                                socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                    $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
            
                   else if( userInput2[1] == 'IRON'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"iron", WhereIsTheUser);
                               
                                socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                    else if( userInput2[1] == 'PAPER'){
                                console.log(" user picked up "+ userInput2[1] + "they are in " + WhereIsTheUser);
                                socket.emit('removeUserItems',"paper", WhereIsTheUser);
                               
                                socket.on('recivedRemovedUserItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemList').empty();
                                    items.forEach((elem)=>{
                                        $('#itemList').append($('<li>').text(elem.name));
                                        })
                                    });
                            
                            socket.on('recivedAddedRoomItems', function(itemsString){
                                    let items = JSON.parse(itemsString);
                                    //console.log( items , items.map(it=>it.name).join('<br>') );
                                    $('#itemsInRoom').empty();
                                    items.forEach((elem)=>{
                                        $('#itemsInRoom').append($('<li>').text(elem));
                                        })
                                    });
                            }
                }break;       
             
            default: {
                $('#status').append( '<br/>...command not recognized...');
            }
        }
    }
    });
    
// When you press enter on the textfield, 
// it automatically clicks on the button "send"
  $('#message').keypress(function(e){
    if (e.which == 13){ // on enter!
        $( '#send' ).trigger( "click" );
        }
    });

});


//  var socket = io();

// var messages = document.getElementById('messages');
// var form = document.getElementById('form');
// var input = document.getElementById('input');

// form.addEventListener('submit', function(e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit('chat message', username+":" +input.value);
//     input.value = '';
//   }
// });

// socket.on('chat message', function(msg) {
//     var item = document.createElement('li');
//     item.textContent = msg;
//     messages.appendChild(item);
//     window.scrollTo(0, document.body.scrollHeight);
//   });