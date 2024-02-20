import WebSocket, {WebSocketServer} from "ws";
const wss = new WebSocketServer({port: 8080});

const clients = {};
const rooms = {};

wss.on("connection", connection => {
    console.log("新使用者已經連線");

    connection.on("message", message => {
        const msgObj = JSON.parse(message);
        if(msgObj.type === "register"){
            const userID = msgObj.userID;
            connection.userID = userID;
            clients[userID] = connection;
            const otherClients = Object.keys(clients);
            let allRooms = [];
            for(let [key, value] of Object.entries(rooms)){
                allRooms.push({id: key, name: value.name})
            }
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: "registered",
                        otherClients,
                        allRooms
                    }));
                }
            });
        }
        if(msgObj.type === "message"){
            const targetUserID = msgObj.targetUserID;
            const fromID = msgObj.userID;
            if(!targetUserID){
                // 公開聊天
                wss.clients.forEach(client => {
                    if(client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({
                            type: "message",
                            message: msgObj.message,
                            fromID
                        }));
                    }
                });
            }else{
                // 俏俏話
                const targetClient = clients[targetUserID];
                if(targetClient && targetClient.readyState === WebSocket.OPEN){
                    targetClient.send(JSON.stringify({
                        type: "message",
                        message: msgObj.message,
                        fromID,
                        private: true
                    }));
                }
            }
        }
        if(msgObj.type === "createRoom"){
            // 建立小房間
            const {roomID, roomName, userID:fromID} = msgObj;
            rooms[roomID] = {
                id: roomID,
                name: roomName,
                userList: [fromID],
            }
            let allRooms = [];
            for(let [key, value] of Object.entries(rooms)){
                allRooms.push({id: key, name: value.name})
            }
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: "newRoom",
                        allRooms
                    }));
                }
            });
        }
        if(msgObj.type === "joinRoom"){
            // 加入小房間
        }
        if(msgObj.type === "leaveRoom"){
            // 離開小房間   
        }
    });

    connection.on("close", () => {
        const dsID = connection.userID;
        if(dsID){
            delete clients[dsID];
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
    })
})

// 預計的訊息規劃
// {
//     type: "register",
//     userID: 120127983747234
// }
// {
//     type: "message",
//     userID: 120127983747234,
//     targetUserID?
//     message: "你好"
//     private?
// }

// {
//     type: "createRoom",
//     roomID
//     roomName
// }

// {
//     type: "joinRoom",
//     roomID
//     userID
// }