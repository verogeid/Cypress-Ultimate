import * as path from 'path';
import { getAliases } from './aliasesHandler';
import { getImportReferences } from './importsHandler';
import { getFixtureReferences } from './fixturesHandler';

const normalizeCypressPath = (_filePath: string, _DEBUG_MODE: boolean): string => {
	const relativePath = _filePath.replace(/\\/g, '/');

	if (relativePath.includes('cypress/')) {
		const normalizedPath = relativePath.slice(relativePath.indexOf('cypress/'));

		if (_DEBUG_MODE) console.log(`Ruta original: ${relativePath} -> Ruta normalizada: ${normalizedPath}`);

		return normalizedPath;
	}

	if (_DEBUG_MODE) console.log(`Ruta original: ${relativePath} -> Ruta no modificada`);
	return relativePath;
};

export const extractReferences = async (_inputFilePath: string = 'cypress/e2e/Tests/API/Cards/GX3-5811-boardMembers.api.cy.ts', _DEBUG_MODE: boolean = false): Promise<string[]> => {
	if (_DEBUG_MODE) console.log(`Iniciando la extracción de referencias para el archivo: ${_inputFilePath}`);

	try {
		if (_DEBUG_MODE) console.log('Obteniendo alias...');
		const aliases = await getAliases();
		if (_DEBUG_MODE) console.log('Alias obtenidos:', aliases);

		if (_DEBUG_MODE) console.log('Obteniendo referencias de importación...');
		const importReferences = await getImportReferences(_inputFilePath, aliases);
		if (_DEBUG_MODE) console.log('Referencias de importación encontradas:', importReferences);

		if (_DEBUG_MODE) console.log('Obteniendo referencias de fixtures...');
		const fixtureReferences = await getFixtureReferences(_inputFilePath);
		if (_DEBUG_MODE) console.log('Referencias de fixtures encontradas:', fixtureReferences);

		const allReferences = [...importReferences, ...fixtureReferences];
		if (_DEBUG_MODE) console.log('Referencias combinadas:', allReferences);

		const resolvedReferences = allReferences.map(ref => path.resolve(ref));

		if (_DEBUG_MODE) console.log('Referencias resueltas:', resolvedReferences);

		const normalizedReferences = resolvedReferences.map(filePath => normalizeCypressPath(filePath, _DEBUG_MODE));

		if (_DEBUG_MODE) console.log('Referencias normalizadas:', normalizedReferences);

		const uniqueReferences = [...new Set(normalizedReferences)];

		if (_DEBUG_MODE) console.log('Referencias normalizadas y únicas:', uniqueReferences);

		return uniqueReferences;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error al extraer las referencias: ${error.message}`);
		} else {
			console.error('Error desconocido al extraer las referencias');
		}
		throw error;
	}
};

// Ejecutar el script directamente si es ejecutado desde la línea de comandos
if (require.main === module) {
	const inputFilePath = process.argv[2];
	const debugModeArg = process.argv[3];

	const debugMode = debugModeArg === 'true';

	if (!inputFilePath) {
		console.error('No se proporcionó un archivo de entrada.');
		process.exit(1);
	}

	extractReferences(inputFilePath, debugMode)
		.then(references => {
			console.log('Referencias extraídas:', references);
		})
		.catch(error => {
			console.error('Hubo un error al extraer las referencias:', error);
		});
}
