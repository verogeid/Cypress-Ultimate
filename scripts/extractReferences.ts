import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

// Función principal para extraer las referencias de importación y fixtures
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
  addFixtureReferences(testFile, fileReferences, allFiles, '');

  // Devolver las referencias y los archivos no encontrados, junto con el log
  const result = {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
    log
  };

  // Guardar el resultado en un archivo JSON
  fs.writeFileSync('extracted_references.json', JSON.stringify(result, null, 2));
  return result;
};

