
/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  util = require('./utils/util')(app),
  EventEmitter = require('events').EventEmitter,
  app = express(),
  mongodbConnection = '';

app.configure(function(){
  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('LF_API_KEY', process.env.LF_API_KEY || 'abc');
  app.set('LF_SECRET', process.env.LF_SECRET || 'abc');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('production', function() {
    mongodbConnection = process.env.MONGOLAB_URI;
});

app.configure('development', function(){
  var mongodbConf = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    };
  mongodbConnection = util.generateMongoUrl(mongodbConf);
  app.use(express.errorHandler());
});

app.configure('test', function(){
  app.use(express.logger('dev'));
  var mongodbConf = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"test"
    };
  mongodbConnection = util.generateMongoUrl(mongodbConf);
  app.set('port', 3001);
});

//Database client
app.mongoose = mongoose.connect(mongodbConnection);
//Emmitter initializing
app.emitter = new EventEmitter();

//Routes
console.log('app boot done, now loading routes...');
require('./routes')(app);
//Events Handler
console.log('routes loaded, now initializing events..');
require('./mw/events')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
module.exports = app;
