var express = require('express');
var morgan = require('morgan');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var app = express();
app.use(morgan('combined'));
var http = require('http').Server(app);
var client = require('socket.io')(http);


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/public/:filename', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', req.params.filename));
});


mongo.connect('mongodb://<dblink>/chat',function(err,db){
  if(err) throw err;

  client.on('connection',function(socket){
    var coll = db.collection('messages');
    var sendStatus = function(s){
      socket.emit('status',s);
    };
    //emit all messages
    coll.find().limit(100).sort({_id:1}).toArray(function(err,res){
      if (err) throw err;
      socket.emit('output',res);
    });
    socket.on('chat',function(data){


      var name = data.name;
      var message = data.message;
      var nothing = /^\s*$/;

      if(nothing.test(name)||nothing.test(message)){
        sendStatus(" Name And message is required !");
      }else{

        coll.insert({name:name,message:message},function(){
          client.emit('output',[data]);
          sendStatus({message:" Message Sent !",clear:true});


        });

      }



    });

    console.log("Someone has connected !");

  });


});
 // Use 8080 for local development because you might already have apache running on 80
http.listen(process.env.PORT, function () {
  console.log("node server started on port 80 !");
});
