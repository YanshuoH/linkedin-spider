var async = require('async');
var url = require('url');
var cheerio = require('cheerio');
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var mongoose = require('mongoose');
var parameters = require('./parameters');
mongoose.connect(parameters.mongoUri);
var LinkedInResultModel = require('./model/LinkedInResult');
var LinkedInProfilModel = require('./model/LinkedInProfil');

/**
 * How it works
 * - Retrieve one LinkedInResult document at time
 * - Crawl the page by using href in previous document
 * - Save results into LinkedInProfilModel
 * - Mark LinkedInResult document as STATUS = YES
 * - Retrieve next linkedInResult document
 */
var findOne = function() {
  LinkedInResultModel.find({
    status: 'NO'
  }).limit(1).exec(function(err, linkedInResults) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < linkedInResults.length; i ++) {
        var linkedInResult = linkedInResults[i];
        parseBySelenium(linkedInResult);
      }
    }
  });
}

findOne();

var parseBySelenium = function (linkedInResult) {
  var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

  var baseLink = linkedInResult.href;
  var link = baseLink;
  var linkParsed = url.parse(link);
  if (linkParsed.search !== null && linkParsed.search.indexOf('trk=') > -1) {
    link = link.replace(linkParsed.search, '') + '/zh' + linkParsed.search
  } else if (linkParsed.search === null) {
    link += '/zh' + '?trk=seokp-title_posts_secondary_cluster_res_author_name';
  }
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
          $ = cheerio.load(bodyElement, {decodeEntities: false});

          var data = {
            href: linkedInResult.href,
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

          linkedInResult.status = 'YES';
          linkedInResult.save(function(err) {
            console.log(err);
          });

          var profil = new LinkedInProfilModel(data);
          profil.save(function(err) {
            if (err) {
              console.log(err);
              profil.name = 'name_blank_holder';
              profil.status = 'PENDING';
              profil.save(function(err) {
                if (err) {
                  console.log(err);
                }
                findOne();
              });
            } else {
              console.log(data.name + ' saved.');
              findOne();
            }
          })
        });
    })

  //return titleParsePromise.then(function() {
  //  console.log(nameParsePromise.value());
  //  console.log(titleParsePromise.value());
  //})
  // Parse name

  // Check

  //driver.findElement(By.css(nameQueryString))
  //  .then(function(nameElement) {
  //    return nameElement.getInnerHtml()
  //      .then(function(name) {
  //        return {
  //          name: name
  //        };
  //      });
  //      //.then(function(result) {
  //      //  driver.findElement(By.css(titleQueryString))
  //      //    .then(function(titleElement) {
  //      //      titleElement.getInnerHtml()
  //      //        .then(function(title) {
  //      //          result.title = title;
  //      //          return result;
  //      //        });
  //      //    }, function(err) {
  //      //      console.log('title', err.name);
  //      //    });
  //      //
  //      //});
  //  }, function(err) {
  //    console.log('name', err.name);
  //  })
  //  .then(function(result) {
  //    console.log(result);
  //  });

  driver.quit();
}
