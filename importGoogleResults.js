var Lbl = require('line-by-line');
var parameters = require('./parameters');
var lr = new Lbl('./google_title_search_href_result');

var mongoose = require('mongoose');
mongoose.connect(parameters.mongoUri);
var GoogleResultModel = require('./model/GoogleResult');

lr.on('error', function(err) {
  console.log(err);
});

lr.on('line', function(line) {
  var googleResult = new GoogleResultModel({
    href: line
  });
  googleResult.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
});

lr.on('end', function() {
  console.log('=============END===============');
});
