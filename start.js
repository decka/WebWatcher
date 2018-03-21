var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var colors = require('colors');

var url_file = 'urls.json';
var urls = JSON.parse(fs.readFileSync(url_file, 'utf8'));

var results = [];

var counter = urls.length;
var callback = function (index, accumulator) {
	results[index] = accumulator;
	counter --;
	if (counter == 0) {
		// Finished
		PrintResults(results);
	}
}

for (index = urls.length - 1; index >= 0; index--)
{
	uRLFetcher(urls, index, callback);
}

function uRLFetcher(urls, index, callback) 
{
	request(urls[index], function handleResponse(error, response, body) {
		if (!error && response.statusCode == 200) 
		{
			var result = extractDetails(urls[index], body, index);
		}
		else
		{
			var result = null;
		}
		callback(index, result);
	})
}

function extractDetails(url, htmlbody, index)
{
	var $ = cheerio.load(htmlbody);

	var streetAddress = $('span[itemprop="streetAddress"]').html();
	var addressLocality = $('span[itemprop="addressLocality"]').html();
	var priceText = $('.priceText').html();

	// Get Inspection Events
	var inspectionTimes = [];
	$('a[itemprop="events"]').each(function () {
		var name = $(this).find('strong[itemprop="name"]').text();
		var time = $(this).find('.time').text();
		inspectionTimes.push(name + ": " + time);
	});

	// Get Agents
	var agents = [];
	$('.agent .agentContactInfo').each(function () {
		var name = $(this).find('.agentName').text();
		var number = $(this).find('.contactDetails .phone').text();
		var item = name + ": " + number;
		// For some reason the names are duplicated, so filter them out.
		if (agents.indexOf(item) === -1) {
			agents.push(item);
		}
	});

	// Available
	var available = $('.available_date span').html();

	return { "index": index + 1, "uRL": url, "address": streetAddress + ', ' + addressLocality, "price": priceText, "inspectionTimes": inspectionTimes, 'agents': agents, 'available': available };
}

function PrintResults(results)
{
	for (i = 0; i < results.length; i++)
	{
		if (results[i] !== null)
		{
			console.log('=================================================================================================='.grey);
			console.log((results[i].index + ': ' + results[i].uRL).yellow);
			console.log(results[i].address);
			console.log(results[i].available.grey);
			for (j = 0; j < results[i].agents.length; j++) {
				console.log(results[i].agents[j].blue);
			}
			console.log(results[i].price);
			for (j = 0; j < results[i].inspectionTimes.length; j++) {
				console.log(results[i].inspectionTimes[j].red);
			}
		}
	}
}