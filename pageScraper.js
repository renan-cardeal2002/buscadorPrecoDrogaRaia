const { Page } = require('puppeteer');
let contPag = 84

const scraperObject = {
	url: 'https://www.drogaraia.com.br/medicamentos.html?page=' + contPag,
	async scraper(browser){
		let page = await browser.newPage();
		

        console.log(`Navegando para ${this.url}...`);
        await page.goto(this.url, {timeout: 0});
			
        const allResultsSelector = '.rd-container-fluid .dqiTTm';
        const resultsSelector = '.products';

		async function scrapeCurrentPage(){
			await page.waitForSelector(allResultsSelector);
			let urls = await page.$$eval(resultsSelector, links => {
				links = links.map(el => el.querySelector('a').href)
				return links;
			});
				
			let pagePromise = (link) => new Promise(async(resolve, reject) => {
				let dataObj = {};
				let newPage = await browser.newPage();
				await newPage.goto(link, {timeout: 0});

				try{
					dataObj['precoProduto'] = await newPage.$eval('.rd-row .rd-col-16 .eRXZWW .hVgczD .cPpbWR .ikFziU', text => text.textContent);
				}
				catch(err){
				}
				try{
					dataObj['nomeProduto'] = await newPage.$eval('.rd-row .rd-col-16 .eRXZWW .gfVohE .title-product', text => text.textContent);
				}
				catch(err){
				}
				try{
					dataObj['codFarma'] = await newPage.$eval('.rd-container-fluid .fRTSsN .eosUuQ .cUnSAh table tbody tr .gjcTgl', text => text.textContent);
					dataObj['ean'] = await newPage.$eval('.rd-container-fluid .fRTSsN .eosUuQ .cUnSAh table tbody', text => text.textContent.split('EAN').pop());
					dataObj.ean = await dataObj.ean.split('P').shift();
				}
				catch(err){
				}
				try{
					dataObj['link'] = link;
				}
				catch(err){
				}

				dataObj['farmacia'] = 'DROGA RAIA';

				resolve(dataObj);
				await newPage.close();
			});

			for(link in urls){
				let currentPageData = await pagePromise(urls[link]);

				var axios = require('axios');

				var config = {
					method: 'post',
					url: 'http://192.168.25.60:3333/util/inserirBuscaPreco',
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiMDIxOTAxOTM5ODIiLCJzZW5oYSI6IlJPTkFMRE8iLCJpYXQiOjE2NzA0OTkxMTMsImV4cCI6MTcwMjAzNTExM30.JqR38Jrk7AQZqIoqk2RLJsmpN7uwe01GQihg5AiB-ws",
					},
					data : JSON.stringify(currentPageData)
				};

				await axios(config)
				.then(function (response) {
				})
				.catch(function (error) {
				});		
			}

			let nextButtonExist = false;
			try{
				const nextButton = await page.$eval('.next-link > a', a => a.textContent);
				nextButtonExist = true;
			}
			catch(err){
				nextButtonExist = false;
			}
			if(nextButtonExist){
				await page.click('.next-link > a');

				return scrapeCurrentPage();
			}
			await page.close();
		}
		let data = await scrapeCurrentPage();
		return data;
	}
}

module.exports = scraperObject;