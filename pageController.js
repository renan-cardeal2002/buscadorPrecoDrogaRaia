const pageScraper = require('./pageScraper');
const fs = require('fs');

async function scrapeAll(browserInstance){
	let browser;
	try{
		browser = await browserInstance;
        let scrapedData = {}
		//await pageScraper.scraper(browser);	
		scrapedData = await pageScraper.scraper(browser);	

		await browser.close();

        // fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
		//     if(err) {
		//         return console.log(err);
		//     }
		//     console.log("The data has been scraped and saved successfully! View it at './data.json'");
		// });


        // var axios = require('axios');

        // var config = {
        //     method: 'post',
        //     url: 'http://192.168.25.60:3333/util/inserirBuscaPreco',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiMDIxOTAxOTM5ODIiLCJzZW5oYSI6IlJPTkFMRE8iLCJpYXQiOjE2NzAzMjYyMDcsImV4cCI6MTY3MDM2MjIwN30.Upd-OwjrcDJNaH7Q4PjlOmiVBiOvIkkXGH-9z5TnZho",
        //     },
        //     data : JSON.stringify(scrapedData)
        // };

        // axios(config)
        // .then(function (response) {
        //     console.log(JSON.stringify(response.data));
        // })
        // .catch(function (error) {
        //     console.log(error.data);
        // });
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)
