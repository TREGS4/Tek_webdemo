const http = require('http');

const port = 8080;


const blockchain_data = require("./other/blockchain")(1000);
const users_data = require("./other/users")();


const { app, sessionMiddleware } = require('./app')(blockchain_data, users_data);

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(port, function() {
    console.log("Server running on " + port);
});


/* Socketio threads for sending signals  */
setInterval(() => {
    io.emit("blockchain_status", blockchain_data.get_server_info());
}, 1000);


setInterval(() => {
    let e = blockchain_data.get_both_data();
    io.emit("blockchain_txs", e);
}, 1000);






io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    require("./listener")(socket);

    socket.emit("blockchain_status", blockchain_data.get_server_info());
    socket.emit("blockchain_txs", blockchain_data.get_both_data());

    socket.on("ask_users", () => {
        socket.emit("ask_users", users_data.get_users());
    });
});