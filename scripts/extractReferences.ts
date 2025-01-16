import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

export const extractReferences = (
  testFile: string,
  aliasFilePath: string
) => {
  const log: string[] = [];
  log.push(`Starting extractReferences for ${testFile}`);

  try {
    // Leer alias desde el archivo
    log.push(`Reading aliases from ${aliasFilePath}`);
    const aliases = JSON.parse(fs.readFileSync(aliasFilePath, 'utf-8'));

    const fileReferences = new Set<string>();
    const allFiles = new Set<string>();
    const notFound = new Set<string>();

    // Agregar las referencias de importación
    log.push('Calling addImportReferences');
    addImportReferences(testFile, fileReferences, allFiles, notFound, aliases, log);
    log.push('Finished calling addImportReferences');

    // Agregar las referencias de fixtures
    log.push('Calling addFixtureReferences');
    addFixtureReferences(testFile, fileReferences, allFiles, path.dirname(testFile), log);
    log.push('Finished calling addFixtureReferences');

    // Mostrar el log generado antes de guardarlo
    log.push('Logging extracted references');
    console.log(log.join('\n'));

    // Guardar el log en un archivo
    fs.writeFileSync('log.txt', log.join('\n'));

    return {
      fileReferences: Array.from(fileReferences),
      notFound: Array.from(notFound),
      log: log
    };
  } catch (error) {
    log.push(`Error in extractReferences: ${error.message}`);
    fs.writeFileSync('log.txt', log.join('\n'));
    throw error;
  }
};


