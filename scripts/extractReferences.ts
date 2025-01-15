import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

// Función para obtener los aliases desde un archivo
const getAliases = (aliasFilePath: string): Record<string, string> => {
  return JSON.parse(fs.readFileSync(aliasFilePath, 'utf-8'));
};

// Función principal para extraer las referencias de importación y fixtures
export const extractReferences = (
  testFile: string,
  aliasFilePath: string
) => {
  const aliases = getAliases(aliasFilePath);
  const fileReferences = new Set<string>();
  const allFiles = new Set<string>();
  const notFound = new Set<string>();

  // Agregar las referencias de importación
  addImportReferences(testFile, fileReferences, allFiles, notFound, aliases);

  // Agregar las referencias de fixtures
  addFixtureReferences(testFile, fileReferences);

  // Devolver las referencias y los archivos no encontrados
  return {
    fileReferences: Array.from(fileReferences),
    notFound: Array.from(notFound),
  };
};

