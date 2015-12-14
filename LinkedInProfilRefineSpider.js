var async = require('async');
var url = require('url');
var cheerio = require('cheerio');
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var mongoose = require('mongoose');
var parameters = require('./parameters');
mongoose.connect(parameters.mongoUri);
var LinkedInProfilModel = require('./model/LinkedInProfil');

LinkedInProfilModel.find({
  status: 'NO'
}).exec(function (err, linkedInProfils) {
  if (err) {
    console.log(err);
  } else {
    for (var i = 0; i < linkedInProfils.length; i ++) {
      var linkedInProfil = linkedInProfils[i];
      if (linkedInProfil.status === 'YES' || linkedInProfil.status === 'PENDING') {
       continue;
      } else {
        parseBySelenium(linkedInProfil);
     }
    }
  }
});

var parseBySelenium = function (linkedInProfil) {
  var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
  var link = linkedInProfil.href;  
  var linkParsed = url.parse(link);
  link = link.replace(linkParsed.search, '') + '/zh' + linkParsed.search
  driver.get(link);

  // name
  var nameQueryString = '#name';
  var titleQueryString = '.profile-overview-content .title';
  var demographicsQueryString = '#demographics';
  var extraInfoQueryString = '.extra-info';
  var connectionsQueryString = '.member-connections strong';


  // Check name
  driver.findElement(By.css('body'))
    .then(function(bodyElement) {
      bodyElement.getInnerHtml()
        .then(function(bodyElement) {
          console.log(link);
          $ = cheerio.load(bodyElement, {decodeEntities: false});

          var data = {
            name: $(nameQueryString).text(),
            title: $(titleQueryString).text(),
            demographicsHtml: $(demographicsQueryString).html(),
            extraInfoHtml: $(extraInfoQueryString).html()
          }

          var connections = $(connectionsQueryString).text();
          if (connections.indexOf('500') > -1) {
            connections = 500;
          }
          data.connections = connections;

          var excludeSectionIds = ['topcard', 'groups', 'ad'];
          var validSections = [];

          var backgroundSections = $('.profile-section');

          backgroundSections.each(function(index, backgroundSection) {
            var sectionId = $(this).attr('id');
            if (excludeSectionIds.indexOf(sectionId) > -1 || !sectionId || sectionId === undefined) {
              // do nothing
            } else {
              validSections.push($(this).html());
            }
          });

          data.backgroundSectionsHtml = validSections;

          for (var field in data) {
            linkedInProfil[field] = data[field];
          }
          linkedInProfil.status = 'YES';

          linkedInProfil.save(function(err) {
            if (err) {
              console.log(err);
              linkedInProfil.name = 'name_blank_holder';
              linkedInProfil.status = 'PENDING';
              linkedInProfil.save(function(err) {
                if (err) {
                  console.log(err);
                }
              });
            } else {
              console.log(data.name + ' updated.');
            }
          })
        });
    })

  driver.quit();
}
