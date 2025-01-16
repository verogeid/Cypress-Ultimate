import * as fs from 'fs';
import * as path from 'path';

export const getImportReferences = async (_inputFilePath: string, _aliases: Record<string, string>): Promise<string[]> => {
	try {
		const fileContent = await fs.promises.readFile(_inputFilePath, 'utf-8');
		const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"];/g;
		const references: string[] = [];
		let match;

		while ((match = importRegex.exec(fileContent)) !== null) {
			let importPath = match[1];

			// Resolver alias
			if (importPath.startsWith('@')) {
				const aliasKey = importPath.split('/')[0];
				if (_aliases[aliasKey]) {
					importPath = importPath.replace(aliasKey, _aliases[aliasKey]);
				}
			}

			// Resolver ruta relativa si es necesario
			if (importPath.startsWith('./') || importPath.startsWith('../')) {
				importPath = path.resolve(path.dirname(_inputFilePath), importPath);
			}

			references.push(importPath);
		}

		return references;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error al leer el archivo de importaciones ${_inputFilePath}: ${error.message}`);
		} else {
			console.error('Error desconocido al leer el archivo de importaciones');
		}
		throw error;
	}
};
