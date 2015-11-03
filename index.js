var fs = require('fs');
var googlePage = require('webpage').create();
googlePage.open('https://www.google.fr/?q=%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86+site:*.linkedin.com%2F*', function(status) {
  console.log(status);
  if (status === 'success') {
    googlePage.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function() {
      googlePage.evaluate(function() {
        $('.rc')
      });
    });
  }
});
