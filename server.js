// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var path = require('path');
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler(req, res) {

  var pathname = req.url;

  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/audience.html';
  }

  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  var contentType = typeExt[ext] || 'text/plain';

  // Now read and write back the file with the appropriate content type
  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Dynamically setting content type
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
  
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('mouse', function(data) {
			// Data comes in as whatever was sent, including objects
			//console.log("Received: 'mouse' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('mouse', data);
		});

		socket.on('text', function(data) {
			socket.broadcast.emit('text',data);
		});
		
		socket.on('clear', function(data) {			
			socket.broadcast.emit('clear', data);
		});
				
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('peer_id', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'peer_id' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('peer_id', data);
		});
				
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
