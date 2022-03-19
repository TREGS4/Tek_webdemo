const http = require('http');

const port = 80;

const { app, sessionMiddleware } = require('./app')();

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(port, function() {
    console.log("Server running on " + port);
});


const blockchain_data = require("./other/blockchain")(1000);




/* Socketio threads for sending signals  */
setInterval(() => {
    io.emit("blockchain_status", blockchain_data.get_server_info());
}, 1000);


setInterval(() => {
    io.emit("blockchain_txs", blockchain_data.get_all_transactions());
}, 1000);






io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    require("./listener")(socket);

    io.emit("blockchain_status", blockchain_data.get_server_info());
    io.emit("blockchain_txs", blockchain_data.get_all_transactions());
});
