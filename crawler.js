var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var CURRENT_URL = '/wiki/Python_Software_Foundation'
var END_URL = '/wiki/International_Data_Corporation'
var SEARCH_WORD = "asdfasder";
var MAX_PAGES_TO_VISIT = 100;

var pagesVisited = {};
var pageRoutes = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var baseUrl = "http://www.wikipedia.org";

pagesToVisit.push(CURRENT_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit[0];
  pagesToVisit.shift();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(baseUrl + nextPage, crawl);
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
       var parse_result = parseHTMLBody($);
       if (parse_result) {
            console.log("Found!");
       } else {
            callback();
       }


      //  var isWordFound = searchForWord($, SEARCH_WORD);
      //  if(isWordFound) {
      //    console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
      //  }
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
    var found = 0;
    // console.log(relativeLinks[0].attribs.href);
    relativeLinks.each(function() {
        if ($(this).attr('href').substring(0,6) == "/wiki/" &&
            $(this).attr('href').substring(6).indexOf(':') < 0 ) {

            if ($(this).attr('href') == END_URL) {
                console.log('found!');
                found = 1;
            }

            if ( !($(this).attr('href') in pageRoutes)) {
                pageRoutes[$(this).attr('href')] = [$(this).attr('href')];
                pagesToVisit.push($(this).attr('href'));
            }

            link_count++;
        }
    });
    // console.log(pageRoutes);
    console.log('total links:' + link_count);
    console.log('total keys:' + Object.keys(pageRoutes).length);
    return found;
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}
