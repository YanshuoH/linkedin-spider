var url = require('url');
var mongoose = require('mongoose');
var parameters = require('./parameters');
mongoose.connect(parameters.mongoUri);
var LinkedInProfilModel = require('./model/LinkedInProfil');

var c = 0;
LinkedInProfilModel.find({}).limit(1000).exec(function(err, docs) {
  for (var i = 0; i < docs.length; i++) {
    var doc = docs[i];
    var parsedUrl = url.parse(doc.href);
    var baseUrl = doc.href.replace(parsedUrl.search, '');
    LinkedInProfilModel.find({
      href: { $regex: baseUrl, $options: "i" }
    }).exec(function(err, results) {
      if ((results.length - 1) > 0) {
        c ++;
        console.log('A duplicate profil found');
        console.log(c);
      }
    });
  }
});