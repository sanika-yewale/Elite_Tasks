const socket = io();

function sendMessage(){

const username =
document.getElementById("username").value;

const message =
document.getElementById("message").value;

if(!username || !message) return;

socket.emit("chat-message",{
username,
message
});

document.getElementById("message").value="";
}

socket.on("chat-message",(data)=>{

const msgBox =
document.getElementById("messages");

const div =
document.createElement("div");

div.classList.add("message");

div.innerHTML =
`<strong>${data.username}</strong>: ${data.message}`;

msgBox.appendChild(div);

msgBox.scrollTop =
msgBox.scrollHeight;

});