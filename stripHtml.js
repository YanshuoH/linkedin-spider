var async = require('async');
var striptags = require('striptags');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var parameters = require('./parameters');
mongoose.connect(parameters.mongoUri);
var LinkedInProfil = require('./model/LinkedInProfil');

var findOne = function() {
  LinkedInProfil.findOne({
    status: 'NO'
  }, function(err, document) {
    if (err) {
      console.log(err);
    } else if (document === null) {
      console.log('=========END===========');
    } else {
      strip(document, function(err) {
        if (err) {
          document.status = 'ERROR';
          document.save(function(err) {
            if (err) {
              console.log(err);
            }
          })
        } else {
          console.log('DONE: ' + document.name);
          findOne();
        }
      });
    }
  });
}

function strip(document, callback) {
  console.log('Teating ' + document.name, 'id: ' + document._id);
  // demographics
  var locationQueryString = '.locality';
  var industryQueryString = '.descriptor';
  var location = null;
  industry = null;

  if (document.demographicsHtml) {
    var $ = cheerio.load(document.demographicsHtml);
    location = $(locationQueryString).text();
    industry = $(industryQueryString).last().text();
  }

  var current = null;
  var previous = null;
  var education = null;
  // extra info
  if (document.extraInfoHtml) {
    var $ = cheerio.load(document.extraInfoHtml);
    var elems = $('tr td');

    elems.each(function(index, element) {
      if (index === 0) {
        current = $(this).text();
      } else if (index === 1) {
        previous = $(this).text();
      } else if (index === 2) {
        education = $(this).text();
      }
    });
  }

  // connections
  if (document.connections > 500) {
    var connectionString = document.connections.toString();
    connectionString = connectionString.substring(0, connectionString.length / 2);
    document.connections = parseInt(connectionString);
  }

  // Background
  var backgroundStripedArray = [];
  for (var i = 0; i < document.backgroundSectionsHtml.length; i ++) {
    var sectionHtml = document.backgroundSectionsHtml[i];
    var $ = cheerio.load(sectionHtml, {decodeEntities: false} );
    var title = $('h3').first().text();
    $('h3').first().remove();
    backgroundStripedArray.push(title + ': ' + striptags($.html()));
  }

  document.location = location;
  document.industry = industry;
  document.current = current;
  document.previous = previous;
  document.education = education;
  document.backgroundStriped = backgroundStripedArray;
  document.status = 'DONE';
  document.save(function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });

};

findOne();