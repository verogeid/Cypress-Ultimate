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
  addFixtureReferences(testFile, fileReferences, log);

  // Guardar las referencias y los archivos no encontrados en el archivo JSON
  const output = {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
    log: log // Incluir los logs en el archivo JSON
  };

  // Escribir el resultado en el archivo JSON
  fs.writeFileSync('extracted_references.json', JSON.stringify(output, null, 2));

  console.log('Referencias extraídas:', output);
};

