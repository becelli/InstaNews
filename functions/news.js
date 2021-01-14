const request = require('request')
const image = require('./imgcreator')
const fs = require('fs')
// Make the request to the API.
function makeRequest(searchTerm, size, apiKey) {
	const options = {
		method: 'GET',
		url: 'https://newscatcher.p.rapidapi.com/v1/search_free',
		qs: { q: searchTerm, lang: 'en', page_size: size, media: 'True' },
		headers: {
			'x-rapidapi-key': apiKey,
			'x-rapidapi-host': 'newscatcher.p.rapidapi.com',
			useQueryString: true,
		},
	}

	request(options, function (error, response, body) {
		if (error) throw new Error(error)
		else {
			console.log('Sucessful request')
			doTasks(body, searchTerm)
		}
	})
}
// All needed tasks to generate good posts.
function doTasks(news, searchTerm) {
	news = JSON.parse(news)
	// Filter wrong images, stranger chars and others.
	let cleanNews = news.articles.filter(selectNews)
	// Create the directory to save the images.
	createDir(searchTerm, 'images')
	createDir(searchTerm, 'links')
	// Create images
	let i = 0
	cleanNews.forEach((posts) => {
		image.create(posts, searchTerm, i++)
	})
}
// Creates the folders to store the links and images.
function createDir(searchTerm, type) {
	// It gets the date of execution.
	let t = new Date()
	let execDate = `${t.getMonth() + 1}-${t.getDate()}-${searchTerm}`
	fs.mkdir(`./news/${type}/${execDate}/`, (err) => {
		if (err) console.log(err)
	})
}
// Filters websites that provide errors or wrong images.
function selectNews(news) {
	if (
		news.media &&
		!news.summary.includes('Source', 0) &&
		!news.summary.includes('http', 0) &&
		!news.summary.includes('.com', 0) &&
		!news.media.includes('globenewswire', 0) &&
		!news.media.includes('.kr', 0) &&
		!news.media.includes('redd.it', 0) &&
		!news.media.includes('reddit', 0) &&
		!news.media.includes('apple-icon-57x57', 0)
	)
		return news
}
exports.generate = makeRequest
