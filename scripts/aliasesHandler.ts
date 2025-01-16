import * as fs from 'fs';
import * as path from 'path';

export const getAliases = async (): Promise<Record<string, string>> => {
	try {
		const filePath = path.resolve(__dirname, '..', '.aliases.json');
		const fileContent = await fs.promises.readFile(filePath, 'utf-8');
		const aliases = JSON.parse(fileContent);
		return aliases;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error al leer el archivo .aliases.json: ${error.message}`);
		} else {
			console.error('Error desconocido al leer el archivo .aliases.json');
		}
		throw error;
	}
};
