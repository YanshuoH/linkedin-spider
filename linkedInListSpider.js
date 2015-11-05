var async = require('async');
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var mongoose = require('mongoose');
var parameters = require('./parameters');
mongoose.connect(parameters.mongoUri);
var GoogleResultModel = require('./model/GoogleResult');
var LinkedInResultModel = require('./model/LinkedInResult');

GoogleResultModel.find({
  status: 'NO',
  parsed: 'NO'
}).exec(function(err, googleResults) {
  if (err) {
    console.log(err);
  } else {
    for (var i = 0; i < googleResults.length; i ++) {
      var googleResult = googleResults[i];
      if (googleResult.href.indexOf('linkedin.com/title') > -1) {
        // Goto list parsing
        linkedInListSpider(i + 1, googleResult, function(index, objectId) {
          console.log('=========== Number ' + index + ' ===============');
          console.log('=========== ObjectId ' + objectId + ' ===============');
        });
      } else if (googleResult.href.indexOf('linkedin.com/pub') > -1
        || googleResult.href.indexOf('linkedin.com/in') > -1) {
        // Save to profil list
        var linkedInResult = new LinkedInResultModel({
          href: googleResult.href
        });
        linkedInResult.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log('=========== Number ' + (i + 1) + ' ===============');
            console.log('=========== ObjectId ' + googleResult.id + ' ===============');
            googleResult.status = 'YES';
            googleResult.parsed = 'YES';
            googleResult.save(function(err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      }
    }
    console.log('=================END===============');
  }
});

function linkedInListSpider(index, googleResult, next) {
  var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

  driver.get(googleResult.href);
  googleResult.parsed = 'YES';
  googleResult.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
  driver.findElements(By.css('.item-container h3.name a'))
    .then(function(elements) {
      for (var i = 0; i < elements.length; i ++) {
        elements[i].getAttribute('href')
          .then(function(profilHref) {
            if (profilHref && profilHref !== undefined) {
              var linkedInResult = new LinkedInResultModel({
                href: profilHref
              });
              async.waterfall([
                function(callback) {
                  console.log('Saving profil link...');
                  linkedInResult.save(function(err) {
                    if (err) {
                      callback(err);
                    } else {
                      callback();
                    }
                  });
                },
                function(callback) {
                  googleResult.status = 'YES';
                  googleResult.save(function(err) {
                    if (err) {
                      callback(err);
                    } else {
                      callback();
                    }
                  })
                }
              ], function(err) {
                if (err) {
                  console.log(err);
                }
              });
            }
          });
      }
    });
  driver.quit();
  next(index, googleResult.id);
}
