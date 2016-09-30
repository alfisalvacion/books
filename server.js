var express = require('express');
var morgan = require('morgan');
var consolidate = require('consolidate');
var bodyparser = require('body-parser');

var promise = require('bluebird');
var options = {promiseLib: promise};
var pgp = require('pg-promise')(options);
var connectionString = 'postgres://japheth:password@localhost:5432/books';
var db = pgp(connectionString);

var app = express(); // basic

////////////////////////////////////////////////////////////////////////////////

app.listen(3000,function() {console.log('Server Running!');});

////////////////////////////////////////////////////////////////////////////////

app.set('views', __dirname + '/views');
app.engine('html', consolidate.nunjucks);
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/static', express.static(__dirname + '/static'));

////////////////////////////////////////////////////////////////////////////////

app.get('/', function(req, res) {
  res.render('index.html');
});

////////////////////////////////////////////////////////////////////////////////

app.get('/list', function(req, res) {
  db.any('select * from book')
  .then(function (data) {
    var arr = [];
    for (var i = 0; i < data.length; i++)
      arr.push(data[i]);
    res.render('list.html', {books:arr});
  });
});

app.get('/getone', function(req, res) {
  if (req.query.id == null) {
    res.render('getone.html', {data:false});
  }
  else {
    db.one('select * from book where id = $1', parseInt(req.query.id))
    .then(function (data) {
      console.log(data);
      res.render('getone.html', data);
    });
  }
});

app.get('/create', function(req, res) {
  res.render('create.html');
});

app.post('/create', function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  if (title.length != 0 && author.length != 0)
    db.none('insert into book(title, author) values($1, $2)',
    [title, author]);
  res.render('create.html');
});

app.get('/update', function(req, res) {
  res.render('update.html');
});

app.post('/update', function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var bookID = req.body.id;
  if (title.length != 0)
    db.none('update book set title = $1 where id = $2', [title, bookID]);
  if (author.length != 0)
    db.none('update book set author = $1 where id = $2', [author, bookID]);
  res.render('update.html');
});

app.get('/remove', function(req, res) {
  res.render('remove.html');
});

app.post('/remove', function(req, res) {
  var bookID = parseInt(req.body.id);
  db.none('delete from book where id = $1', bookID);
  res.render('remove.html');
});

////////////////////////////////////////////////////////////////////////////////
