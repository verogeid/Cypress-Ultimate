import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

export const extractReferences = (
  testFile: string,
  aliasFilePath: string
) => {
  console.log('Iniciando extractReferences');
  
  const aliases = JSON.parse(fs.readFileSync(aliasFilePath, 'utf-8'));
  const fileReferences = new Set<string>();
  const allFiles = new Set<string>();
  const notFound = new Set<string>();
  const log: string[] = [];

  console.log('Agregando referencias de importación...');
  addImportReferences(testFile, fileReferences, allFiles, notFound, aliases, log);

  console.log('Agregando referencias de fixtures...');
  addFixtureReferences(testFile, fileReferences, allFiles, path.dirname(testFile), log);

  // Mostrar log en consola antes de guardarlo
  console.log('Log generado:');
  console.log(log.join('\n'));

  // Guardar el log en un archivo
  fs.writeFileSync('log.txt', log.join('\n'));

  console.log('ExtractReferences completado');

  // Devolver las referencias y los archivos no encontrados
  return {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
    log: log
  };
};

