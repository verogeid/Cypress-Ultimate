/* eslint-disable @typescript-eslint/naming-convention */
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import 'dotenv/config';
import * as crypto from 'crypto'; // @verogeid: Importar crypto para OAuth 1.0

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Envs = 'dev' | 'qa' | 'stage' | 'prod';
const enviroments = {
	dev: 'https://demoqa.com',
	qa: 'https://demoqa.com',
	stage: 'https://demoqa.com',
	prod: 'https://demoqa.com'
};
const cyEnv = process.env.CYPRESS_ENVIRONMENT as Envs;
const env = process.env.CI ? cyEnv : ('prod' as Envs);
const baseUrl = enviroments[env];

const orangeUsername = process.env.USERNAME;
const orangePassword = process.env.PASSWORD;
if (!orangePassword || !orangeUsername) {
	new Error('MISSING CREDENTIALS: USERNAME OR PASSWORD');
}

const trelloToken = process.env.TRELLO_TOKEN;
const trelloKey = process.env.TRELLO_TOKEN;
if (!trelloToken || !trelloKey) {
	new Error('MISSING CREDENTIALS: TRELLO KEY OR TOKEN');
}

export default defineConfig({
	pageLoadTimeout: 20000,
	// @Ely: CYPRESS DASHBOARD PARA VER NUESTRAS EJECUCIONES EN LA WEB:
	projectId: '2pw67q', //? ID del proyecto CYPRESS-DEMO-CLOUD. Record Key para usar: "b6bde345-a36c-4fab-ad8c-cddc065d2cba"
	// @Ely: Link para ver el proyecto Cloud: https://cloud.cypress.io/projects/2pw67q/analytics/runs-over-time
	// 1280×720 is considered to be the most suitable screen resolution for the desktop website version:
	viewportWidth: 1920,
	viewportHeight: 1080,
	downloadsFolder: 'cypress/downloads',
	videosFolder: 'cypress/videos',
	screenshotsFolder: 'cypress/screenshots',
	screenshotOnRunFailure: true,
	scrollBehavior: 'center',
	// Number of times to retry a failed test. If a number is set, tests will retry in both runMode and openMode:
	retries: process.env.CI ? 3 : 0,
	// Whether Cypress will record a video of the test run when running on headless:
	video: Boolean(process.env.CI),
	// Whether Cypress will watch and restart tests on test file changes:
	watchForFileChanges: false,
	// En Caso de hacer testing en SUT con seguridad web:
	chromeWebSecurity: false,
	// multi-reporters: one report.xml + mochawesome.json per file.
	reporter: 'cypress-multi-reporters',
	reporterOptions: {
		configFile: 'cypress.reporter.chrome.json'
	},
	// E2E Testing runner
	e2e: {
		baseUrl: baseUrl,
		// Glob pattern to determine what test files to load:
		specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'],
		excludeSpecPattern: ['cypress/e2e/**/*.example.cy.js'],
		// Use Cypress plugins:
		setupNodeEvents(on, config) {
			// This is required for the preprocessor to be able to generate JSON reports after each run, and more,
			on('file:preprocessor', createBundler());
			on('task', {
				// @verogeid: Agregar la tarea para generar la firma
				generateSignature({ baseString, key }: { baseString: string; key: string }) {
					return crypto.createHmac('sha1', key).update(baseString).digest('base64');
				}
			});

			//---- Crear Enlace a Resultados Multimedia -----

			on('after:run', (results: any) => {
				const repoBaseUrl = 'https://github.com/verogeid/Cypress-Ultimate/blob/main/'; // Cambia 'verogeid' por tu usuario en GitHub

				// Asegurémonos de verificar la estructura completa de results
				console.log(JSON.stringify(results, null, 2));

				// Ahora intentamos acceder de manera más segura
				if (results && Array.isArray(results?.videos)) {
					results.videos.forEach((video: { name: string; path: string }) => {
						const videoUrl = `${repoBaseUrl}${video.path.replace('/home/runner/work/Cypress-Ultimate/Cypress-Ultimate/', '')}`;
						console.log(`Vídeo: ${videoUrl}`);
					});
				}

				if (results && Array.isArray(results?.screenshots)) {
					results.screenshots.forEach((screenshot: { name: string; path: string }) => {
						const screenshotUrl = `${repoBaseUrl}${screenshot.path.replace('/home/runner/work/Cypress-Ultimate/Cypress-Ultimate/', '')}`;
						console.log(`Imagen: ${screenshotUrl}`);
					});
				}
			});

			//---------------

			on('before:browser:launch', (browser, launchOptions) => {
				//? About this Solution:
				//? When browser Chromium was executing test on demoqa, it was having performance issues with the ads before loading the page
				//? So we need to add the extension "AdBlock" to the browser Chrome, in order to avoid the ads and improve the performance.
				if (browser.family === 'chromium' && browser.name !== 'electron') {
					const pathToExtension = path.join(__dirname, 'extension/adblock'); //? path to the extension AdBlock (already downloaded in the project)
					if (!fs.existsSync(pathToExtension)) throw new Error(`Cannot find extension at ${pathToExtension}`);
					launchOptions.args.push(`--disable-extensions-except=${pathToExtension}`);
					launchOptions.args.push(`--load-extension=${pathToExtension}`);
					if (process.env.CI) launchOptions.args.push('--headless=new');
					// eslint-disable-next-line no-console
					console.log('✅ AdBlock extension for chrome is loaded');
					// console.log(launchOptions.args); //? print all current args to check if the extension is being loaded
					return launchOptions;
				}
			});
			// Make sure to return the config object as it might have been modified by the plugin.
			return config;
		}
	},
	env: {
		orangeUsername,
		orangePassword,
		TRELLO_TOKEN: process.env.TRELLO_TOKEN,
		TRELLO_KEY: process.env.TRELLO_KEY
	}
});
