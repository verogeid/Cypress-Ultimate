import * as fs from 'fs';
import * as path from 'path';

export const getFixtureReferences = async (_filePath: string): Promise<string[]> => {
	const fixtureReferences: string[] = [];
	try {
		// Leer el archivo de prueba
		const fileContent = await fs.promises.readFile(_filePath, 'utf-8');

		// Regex para encontrar todas las referencias de fixtures (cy.fixture)
		const fixtureRegex = /cy\.fixture\(['"]([^'"]+)['"]\)/g;
		let match;

		// Buscar todas las coincidencias de fixtures
		while ((match = fixtureRegex.exec(fileContent)) !== null) {
			const fixturePath = match[1];

			// Resolver la ruta de fixtures en 'cypress/fixtures'
			const resolvedFixturePath = `${path.join('cypress/fixtures', fixturePath)}.json`;
			fixtureReferences.push(resolvedFixturePath);
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error al leer el archivo de prueba:', error.message);
		} else {
			console.error('Error desconocido al leer el archivo de prueba');
		}
	}

	return fixtureReferences;
};
