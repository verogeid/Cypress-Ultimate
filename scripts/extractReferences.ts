import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

// Función para leer el archivo .aliases.json y convertirlo a un objeto
const readAliases = (aliasFilePath: string) => {
  const aliasData = fs.readFileSync(aliasFilePath, 'utf-8');
  return JSON.parse(aliasData);
};

// Función principal para extraer las referencias de importación y fixtures
const extractReferences = (testFile: string, aliasFilePath: string) => {
  const aliases = readAliases(aliasFilePath);
  const fileReferences: Set<string> = new Set();
  const allFiles: Set<string> = new Set();
  const notFound: Set<string> = new Set();

  // Leer el contenido del archivo de prueba
  const testFilePath = path.resolve(testFile);
  const resolvedTestFile = fs.existsSync(testFilePath) ? testFilePath : null;
  if (resolvedTestFile) {
    // Buscar las importaciones y resolverlas
    addImportReferences(resolvedTestFile, fileReferences, allFiles, notFound);

    // Buscar las fixtures y resolverlas
    addFixtureReferences(resolvedTestFile, fileReferences, allFiles);
  }

  // Recorrer recursivamente los archivos de referencias
  const filesToProcess = Array.from(fileReferences);
  for (const file of filesToProcess) {
    addImportReferences(file, fileReferences, allFiles, notFound);
    addFixtureReferences(file, fileReferences, allFiles);
  }

  return { fileReferences: Array.from(fileReferences), notFound: Array.from(notFound) };
};

// Ejecución principal
const testFile = process.argv[2];  // Ruta del archivo de prueba
const aliasFilePath = '.aliases.json';  // Ruta del archivo de aliases

const { fileReferences, notFound } = extractReferences(testFile, aliasFilePath);

const result = {
  fileReferences,
  notFound,
};

// Guardar en archivo JSON
fs.writeFileSync('extracted_references.json', JSON.stringify(result, null, 2));

console.log('Referencias extraídas:', fileReferences);
console.log('Referencias no encontradas:', notFound);