(function(){
    const app = document.querySelector(".appBody");
    const socket = io();

    let yourName;

    app.querySelector(".join_screen #join_user").addEventListener("click", function(){
        let username = app.querySelector(".join_screen #username").value;
        if(username.length == 0){
            return;
        }
        socket.emit("newUser", username);
        yourName = username;
        app.querySelector(".join_screen").classList.remove("active");
        app.querySelector(".chat_screen").classList.add("active");
    });
    
    app.querySelector(".chat_screen #send_message").addEventListener("click", function(){
        sendMessage();
    });

    app.querySelector(".chat_screen #message_input").addEventListener("keydown", function(event){
        if(event.keyCode === 13){
            sendMessage();
        }
    });

    function sendMessage(){
        let message = app.querySelector(".chat_screen #message_input").value;
        if(message.length == 0){
            return;
        }
        renderMessage("my",{
            username:yourName, text:message
        });
        socket.emit("chat",{
            username:yourName, text:message
        });
        app.querySelector(".chat_screen #message_input").value = "";
    }

    app.querySelector(".chat_screen #exit_chat").addEventListener("click", function(){
            socket.emit("exitUser", yourName);
            window.location.href = window.location.href;
    });

    socket.on("update", function(update){
        renderMessage("update", update);
    });

    socket.on("chat", function(message){
        renderMessage("other", message);
    });
    
    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat_screen .messages");
        if(type == "my"){
            let el = document.createElement("div");
            el.setAttribute("class", "message my_message");
            el.innerHTML = 
            `<div class="Message">
                <div class="name">You</div>
                <div class="text">${message.text}</div>
            </div>`;
            messageContainer.appendChild(el);
        }else if(type == "other"){
            let el  = document.createElement("div");
            el.setAttribute("class", "message other_message");
            el.innerHTML = 
            `<div class="Message">
                <div class="name">${message.username}</div>
                <div class="text">${message.text}</div>
            </div>`;
            messageContainer.appendChild(el);
        }else if(type == "update"){
            let el  = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    } 
})();