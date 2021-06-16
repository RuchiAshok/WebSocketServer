const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');

// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
console.log('listening on port 8000');


const wsServer = new webSocketServer({
  httpServer: server
});

const clients = {};

let onlineUsers ={};
let onlineList ={};


// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

wsServer.on('request', function (request) {
  var userID = getUniqueID();
  var user = null;
   //console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');

  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

  connection.on('message', function(message) {

    if (message.type === 'utf8') {
      console.log('Received Message: ', message.utf8Data);

      let userData =  JSON.parse(message.utf8Data);
      
     switch(userData.type){
      case "myInfo" :
        {
        user = userData.user;
        onlineUsers[user] = {
          connection: connection,
          username: userData.user
        };
        onlineList[user]= {
          username: userData.user
        }
     
        for(user in onlineUsers) {
          onlineUsers[user].connection.send(JSON.stringify({
            type: "online_users",
            user: onlineList
          }));
        }
        
        
        break;
      }
      case "message_2" :{
        onlineUsers[userData.msgTo].connection.send(JSON.stringify({
          type: "message_2",
          msgFrom: userData.msgFrom,
          msg:userData.msg,
          msgTo:userData.msgTo,
        }));
        break;
      }

      case"message_all":{
        // broadcasting message to all connected clients
        for(key in clients) {
        clients[key].sendUTF(message.utf8Data);
      //  console.log('sent Message to: ', clients[key]);
        }

        break;
      }
    
    }



      
    }
  })
});