var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.wikipedia.org/wiki/Python_(programming_language)";
// var START_URL = "http://www.edwardzhu.me";
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
     if(response.statusCode !== 200) {
       console.log("Status code: " + response.statusCode);
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
    //  get page title
     console.log("Page title:  " + $('title').text());
     parseHTMLBody($);

     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     }

    //  collectInternalLinks($);
     // In this short program, our callback is just calling crawl()
    //  callback();
  });
}

function parseHTMLBody($) {
  // var relativeLinks = $("a[href^='http']");
  var relativeLinks = $("a[href^='/']");
  var link_count = 0;
  var valid_links = [];
  // console.log(relativeLinks[0].attribs.href);
  relativeLinks.each(function() {
      if ($(this).attr('href').substring(0,6) == "/wiki/" &&
          $(this).attr('href').substring(6).indexOf(':') < 0 ) {
        // console.log($(this).attr('href'));
        pagesToVisit.push($(this).attr('href'));
        link_count++;
      }
      //
  });
  console.log(pagesToVisit);
  console.log('total links:' + link_count);
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

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}
