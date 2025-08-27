// sockets/index.js
module.exports=(io)=>{
  const Trade=require('../models/Trade');
  io.on('connection',socket=>{
    socket.join(socket.handshake.query.userId);
    Trade.watch().on('change',change=>{
      if(change.operationType==='update'){
        io.to(change.fullDocument.player.toString()).emit('tradeUpdate',change.fullDocument);
      }
    });
  });
};
