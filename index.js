const http = require("http");
const fs = require("fs");
const path = require("path");

const config = require("./config.json");

const capesDir = path.join(__dirname, config.capesDir);

const images = fs.readdirSync(capesDir);
let imagesCache = {};

const server = http.createServer(async (req, res) => {
	try {
		let url = req.url;
		if (!url.startsWith("/")) {
			res.statusCode = 400;
			res.end();
			return;
		}
		url = url.substring(1);
		url = url.split("/").filter(e=>e.length);
		let cape = url[1];
		if (url[0] == config.capesUrl) {
			if (url.length == 2 && cape.match(/^[0-9a-zA-Z_]{1,16}\.png$/)) {
				if (images.includes(cape)) {
					if (!imagesCache[cape]) {
						try {
							let file = path.join(capesDir, cape);
							imagesCache[cape] = await fs.readFileSync(file);
						} catch (err) {
							console.error(err);
							delete imagesCache[cape];
							let i = images.indexOf(cape);
							if (i > -1) images.splice(i, 1);
						}
					}
					if (imagesCache[cape]) {
						res.statusCode = 200;
						res.setHeader("Content-Type", config.imageMime);
						res.end(imagesCache[cape]);
						return;
					}
				}
			}
			res.statusCode = 301;
			res.setHeader("Location", config.originalHost, req.url);
			res.end();
			return;
		}
		res.statusCode = 404;
		res.end("Not found");
	} catch (err) {
		console.error(err);
		res.statusCode = 500;
		res.end("Internal server error");
	}
});

server.listen(config.listenPort, config.listenIp, () => {
	console.log(`Server running`);
});
