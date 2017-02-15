(function(){

  var getNode = function(selector){
    return document.querySelector(selector);
  };

  var chatName = getNode('.chat-name');
  var messages = getNode('.chat-messages');
  var textArea = getNode('.container-fluid textarea');
  var status = getNode('.chat-status span');
  var submit = getNode('.submit');

  var statusDefault = status.textContent;
  var setStatus = function(s){
    status.textContent = s;
    if(s !== statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
        clearInterval(delay);
      },3000);
    }

  };
  setStatus(" Wait");

  try{
    var socket = io.connect('https://nodejschat2017.herokuapp.com');
  }catch(e){
    //alert the user of error

  }

  if(socket !== undefined){
    //lister for output
    socket.on('output',function(data){
      if(data.length){
        for(var x = 0 ; x<data.length;x++){
          var message = document.createElement('div');
          message.setAttribute('class','chat-message');
          message.textContent = data[x].name + " : " + data[x].message;
          messages.appendChild(message);
          messages.insertBefore(message,messages.firstChild);
        }
      }
    });

    //listening for status
    socket.on('status',function(data){
      setStatus((typeof data === 'object')? data.message :data);

      if(data.clear === true){
        textArea.value = '';
      }

    });

    //event for keydown enter and shift+enter
    textArea.addEventListener('keydown',function(event){
      var self = this ;
      var name = chatName.value;
      if(event.which === 13 && event.shiftKey === false){
        socket.emit('chat',{name : name , message : self.value});
        event.preventDefault();
      }
    });

    submit.addEventListener('click',function(event){
      var self = textArea.value ;
      var name = chatName.value;
      socket.emit('chat',{name : name , message : self});

    });

  }


})();
