let io = null;

// Message Receive functionality.
export function socketOpen(server) {
    try{
        io = require('socket.io')(server);
        io.sockets.on('connection', (socket) => {
            //todo create one callback function
            socket.on('test', (data) => {
                console.log('test', data);
            });
        });
    }catch(error){
        console.log(error);
    }
}

// Publish Message To socket.
export async function socketPublishMessage(publishChannelName, publishData) {
    try {
        io.sockets.emit(publishChannelName, publishData);
        return 'success';
    }
    catch(error) {
        return error.message.toString();
    }
}
