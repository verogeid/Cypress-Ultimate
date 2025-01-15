import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

export const extractReferences = (
  testFile: string,
  aliasFilePath: string
) => {
  const aliases = JSON.parse(fs.readFileSync(aliasFilePath, 'utf-8'));
  const fileReferences = new Set<string>();
  const allFiles = new Set<string>();
  const notFound = new Set<string>();
  const log: string[] = [];

  // Agregar las referencias de importación
  addImportReferences(testFile, fileReferences, allFiles, notFound, aliases, log);

  // Agregar las referencias de fixtures
  addFixtureReferences(testFile, fileReferences, allFiles, path.dirname(testFile), log);

  // Guardar el log en un archivo o variable según sea necesario
  fs.writeFileSync('log.txt', log.join('\n'));

  // Devolver las referencias y los archivos no encontrados, incluyendo el log
  const result = {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
    log: log
  };

  // Escribir el resultado completo, incluyendo el log, en el archivo JSON
  fs.writeFileSync('extracted_references.json', JSON.stringify(result, null, 2));

  return result;
};

