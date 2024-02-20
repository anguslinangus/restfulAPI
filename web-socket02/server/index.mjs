import WebSocket, {WebSocketServer} from "ws";
const wss = new WebSocketServer({port: 8080});

const clients = {};

wss.on("connection", connection => {
    console.log("新使用者已經連線");

    connection.on("message", message => {
        const msgObj = JSON.parse(message);
        if(msgObj.type === "register"){
            const userID = msgObj.userID;
            connection.userID = userID;
            clients[userID] = connection;
            //it gives you an array containing the keys
            const otherClients = Object.keys(clients);
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: "registered",
                        otherClients
                    }));
                }
            });
        }
        if(msgObj.type === "message"){
            
        }
    });

    connection.on("close", () => {
        const dsID = connection.userID;
        if(dsID){
            delete clients[dsID]
        }
        const otherClients = Object.keys(clients);
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: "disconnected",
                        otherClients,
                        disconnectedID: dsID
                    }));
                }
            });    
    });
})

// 預計的訊息規劃
// {
//     type: "register",
//     userID: 120127983747234
// }

// {
//     type: "message",
//     userID: 120127983747234,
//     message: "你好"
// }
