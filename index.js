var app = require('./app')
var http = require('http')
var PORT = process.env.PORT || 8080

http.Server(app).listen(PORT, function() {
    console.log("HTTP server listening on port %s", PORT);
});