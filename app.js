var express = require('express');
var expressHandlebars  = require('express-handlebars');
var logger = require('morgan');

var LINES = [
    "If you're going through hell, keep going",
    "And all that glitters is gold",
    "Only shooting stars break the mold",
    "Hello From Urvil"
];

var lineIndex = 0;

var app = express();
app.engine('html', expressHandlebars());
app.set('view engine', 'html');
app.use(logger('dev'));
app.set('views', __dirname);
app.get('/', function(req, res) {
    var message = LINES[lineIndex];

    lineIndex += 1;
    if (lineIndex >= LINES.length) {
        lineIndex = 0;
    }

    res.render('index', {message: message});
});

module.exports = app