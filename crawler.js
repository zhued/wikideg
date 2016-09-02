var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.wikipedia.org/wiki/Python_(programming_language)";
var SEARCH_WORD = "asdfasder";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}


function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("visit = " + url);
  console.log("");
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
    //  console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       console.log("Status code: " + response.statusCode);
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var htmlbody = parseHTMLBody($);

     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     }

    //  collectInternalLinks($);
     // In this short program, our callback is just calling crawl()
    //  callback();
  });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });

    var absoluteLinks = $("a[href^='http']");
    console.log("Found " + absoluteLinks.length + " absolute links on page");
    absoluteLinks.each(function() {
        pagesToVisit.push($(this).attr('href'));
    });

}

function parseHTMLBody($) {
  // var bodyText = $('html > body').text().toLowerCase();
  var absoluteLinks = $("a[href^='http']");
  var link_count = 0;
  absoluteLinks.each(function() {
      // console.log(absoluteLinks);
      link_count++;
      // pagesToVisit.push($(this).attr('href'));
  });
  console.log(link_count);
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}
