const http = require("http");
const fs = require("fs");
const path = require("path");

process.chdir(__dirname);

const images = fs.readdirSync("capes");
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
		if (url[0] == "capes") {
			if (url.length == 2 && cape.match(/^[0-9a-zA-Z_]{1,16}\.png$/)) {
				if (images.includes(cape)) {
					if (!imagesCache[cape]) {
						try {
							imagesCache[cape] = await fs.readFileSync(path.join("capes", cape));
						} catch (err) {
							console.error(err);
							delete imagesCache[cape];
							let i = images.indexOf(cape);
							if (i > -1) images.splice(i, 1);
						}
					}
					if (imagesCache[cape]) {
						res.statusCode = 200;
						res.setHeader("Content-Type", "image/png");
						res.end(imagesCache[cape]);
						console.log(cape,imagesCache[cape]);
						return;
					}
				}
			}
			res.statusCode = 301;
			res.setHeader("Location", "http://107.182.233.85" + req.url);
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

server.listen(80, "127.0.0.1", () => {
	console.log(`Server running`);
});
