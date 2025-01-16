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

  log.push('Entering extractReferences function');

  try {
    // Agregar las referencias de importación
    log.push('Calling addImportReferences');
    addImportReferences(testFile, fileReferences, allFiles, notFound, aliases, log);
    log.push('Finished addImportReferences');

    // Agregar las referencias de fixtures
    log.push('Calling addFixtureReferences');
    addFixtureReferences(testFile, fileReferences, allFiles, path.dirname(testFile), log);
    log.push('Finished addFixtureReferences');
  } catch (error: any) {
    log.push(`Error in extractReferences: ${error.message}`);
    throw error;
  }

  // Mostrar el log antes de guardarlo
  console.log('Log content:', log.join('\n'));

  // Guardar el log en un archivo o variable según sea necesario
  fs.writeFileSync('log.txt', log.join('\n'));

  // Devolver las referencias y los archivos no encontrados
  return {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
    log: log
  };
};

