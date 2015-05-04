var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var url_file = 'urls.json';

var urls = JSON.parse(fs.readFileSync(url_file, 'utf8'));

var results = [];

for (index = 0; index < urls.length; index++)
{
	results.push((function(url, index) {
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    var $ = cheerio.load(body);

		    var streetAddress = $('span[itemprop="streetAddress"]').html();
		    var addressLocality = $('span[itemprop="addressLocality"]').html();
		    var priceText = $('.priceText').html();

		    console.log('==================================================================================================');
		    console.log((index + 2) + ': ' + url);
		    console.log('==================================================================================================');
		    console.log(streetAddress);
		    console.log(addressLocality);
			console.log(priceText);

			// Get Inspection Events
		    $('a[itemprop="events"]').each(function (index) {
		    	var name = $(this).find('strong[itemprop="name"]').text();
		    	var time = $(this).find('.time').text();
		    	console.log(name + ": " + time);
		    });
		  }
		  return streetAddress;
		})
	})(urls[index], index));
}
console.log('================');
console.log(results);

function hello()
{
	console.log('Hello!');
}