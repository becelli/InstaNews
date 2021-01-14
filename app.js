const news = require('./functions/news')
const key = 'Your API Key here' // (RapidAPI)
// This API accepts any keywords, but only accepts until 100 articles per request.
console.log('Making request...')
news.generate('Python', '100', key)
