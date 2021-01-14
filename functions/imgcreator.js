const fs = require('fs')
const fetchMethod = require('node-superfetch')
const Canvas = require('canvas')
const { registerFont } = require('canvas')
// Load needed fonts.
registerFont('./assets/PTSerif-Regular.ttf', { family: 'PT Serif' })
registerFont('./assets/PTSerif-Bold.ttf', { family: 'PT Serif Bold' })
// Define the sizes of the final image/post.
const width = 1080
const height = 1350
const margin = 20
const fontSize = 52

// CREATE IMAGES
const create = async (news, searchTerm, id) => {
	const canvas = Canvas.createCanvas(width, height)
	const ctx = canvas.getContext('2d')
	var imageY
	// Fill background
	ctx.fillStyle = '#111126'
	ctx.fillRect(0, 0, width, height)
	// Write the news title.
	ctx.fillStyle = '#fff'
	imageY = wrapText(
		news.title,
		'left',
		margin,
		margin,
		width - 2 * margin,
		fontSize,
		'PT Serif Bold',
		ctx
	)
	// Write description
	ctx.fillStyle = '#ddd'
	imageY = wrapText(
		news.summary,
		'left',
		margin,
		imageY,
		width - 2 * margin,
		fontSize * 0.9,
		'PT Serif',
		ctx
	)
	imageY *= 1.03

	// Specific to Instagram. Remove if you want.
	ctx.fillStyle = '#eee'
	imageY = wrapText(
		'Check the bio to learn more',
		'center',
		margin,
		imageY,
		width - 2 * margin,
		fontSize * 0.7,
		'PT Serif',
		ctx
	)

	try {
		// Load image
		const { body: img } = await fetchMethod.get(news.media)
		const image = await Canvas.loadImage(img)
		var imgW = image.width
		var imgH = image.height
		var proportion = imgW / imgH
		var canvasH = height - imageY
		var canvasW = proportion * canvasH
		if (canvasW < width) {
			var aux = (width - canvasW) / 2
			ctx.drawImage(image, 0, 0, imgW, imgH, aux, imageY, canvasW, canvasH)
		} else {
			var cutX = (canvasW - width) / 2
			ctx.drawImage(image, 0, 0, imgW, imgH, -cutX, imageY, canvasW, canvasH)
		}
		// Draw image
		var t = new Date()
		const buffer = canvas.toBuffer('image/png')
		const execDate = `${t.getMonth() + 1}-${t.getDate()}-${searchTerm}`
		await fs.writeFileSync(`./news/images/${execDate}/image${id}.png`, buffer)
		await fs.appendFileSync(
			`./news/links/${execDate}/links.txt`,
			`${news.title}\n${news.summary}\n${news.link}\n${news.published_date} - ${news.country} \n\n\n`
		)
	} catch (err) {
		console.log(err)
		return
	}
}

// Wrap the texts, simulating an paragraph.
function wrapText(text, align, x, y, maxWidth, fontSize, fontFamily, ctx) {
	var words = text.split(' ')
	var line = ''
	var lineHeight = fontSize * 1.286
	ctx.font = `${fontSize}px ${fontFamily}`

	ctx.textBaseline = 'top'
	var wasModified = 0
	// Cut phrases greater than 55 words.
	if (words.length > 55) {
		wasModified = 1
		words.length = 56
		words[55] = words[55] + '...'
	}
	for (var n = 0; n < words.length; n++) {
		var word = line + words[n] + ' '
		var metrics = ctx.measureText(word)
		var testWidth = metrics.width

		if (testWidth > maxWidth) {
			// Align to left and center.
			if (align == 'left') ctx.fillText(line, x, y)
			else if (align == 'center') {
				var centerX = x + testWidth / 2
				ctx.fillText(line, centerX, y)
			}
			if (n <= words.length - 1) {
				line = words[n] + ' '
				y += lineHeight
			}
		} else {
			line = word
		}
	}
	// Align to left or center.
	if (align == 'left') ctx.fillText(line, x, y)
	else if (align == 'center') {
		var centerX = x + testWidth / 2
		ctx.fillText(line, centerX, y)
	}
	if (wasModified) ctx.fillText('...', x, y)
	// get the Y to the next element.
	var endOfLine = y + lineHeight
	return endOfLine
}

exports.create = create
