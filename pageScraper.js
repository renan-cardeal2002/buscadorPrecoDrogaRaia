const { Page } = require('puppeteer');
let contPag;

const scraperObject = {
	url: 'https://www.drogaraia.com.br/medicamentos.html?page=',
	async scraper(browser){
		var axios = require('axios');
		let page = await browser.newPage();

		var config = {
			method: 'post',
			url: 'http://192.168.25.60:3333/util/buscarLinkPagina',
			headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiMDIxOTAxOTM5ODIiLCJzZW5oYSI6IlJPTkFMRE8iLCJpYXQiOjE2NzA0OTkxMTMsImV4cCI6MTcwMjAzNTExM30.JqR38Jrk7AQZqIoqk2RLJsmpN7uwe01GQihg5AiB-ws",
					},
			data : {
						farmacia: 'DROGA RAIA'
					}
		};

		await axios(config)
		.then(function (response) {
			contPag = response.data;
		})
		.catch(function (error) {
			contPag = '';
		});	

		let urlNav = this.url;

		async function scrapeCurrentPage(){
			await page.goto(urlNav + contPag, {timeout: 0});
		
			console.log(`Navegando para ${urlNav}${contPag}...`);
				
			const allResultsSelector = '.rd-container-fluid .dqiTTm';
			const resultsSelector = '.products';
	
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

			contPag++;
			
			var axios = require('axios');
			var config1 = {
				method: 'post',
				url: 'http://192.168.25.60:3333/util/inserirLinksBuscaPreco',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiMDIxOTAxOTM5ODIiLCJzZW5oYSI6IlJPTkFMRE8iLCJpYXQiOjE2NzA0OTkxMTMsImV4cCI6MTcwMjAzNTExM30.JqR38Jrk7AQZqIoqk2RLJsmpN7uwe01GQihg5AiB-ws",
				},
				data : {
					farmacia: 'DROGA RAIA',
					pagina: contPag
				}
			};
			await axios(config1)
			.then(function (response) {
				contPag = response.data;
			})
			.catch(function (error) {
				contPag = '';
			});	
			
			//await page.close();
			return scrapeCurrentPage();
		}

		let data = await scrapeCurrentPage();
		return data;
	}
}

module.exports = scraperObject;