const chatBox = document.querySelector("#chat-box");
const chatInput = document.querySelector("[name=chatInput]");
const btnSend = document.querySelector("button");
const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("open", () => {
    console.log("連接到 WebSocket 伺服器");
})

ws.addEventListener("message", async e => {
    const msg = await e.data.text();
    chatBox.innerHTML += `<div>${msg}</div>`
})

btnSend.addEventListener("click", () => {
    const msg = chatInput.value;
    ws.send(msg);
    chatInput.value = "";
})