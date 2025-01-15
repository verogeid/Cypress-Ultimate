import fs from 'fs';
import path from 'path';

// Función para leer el archivo .aliases.json y convertirlo a un objeto
const readAliases = (aliasFilePath: string) => {
  const aliasData = fs.readFileSync(aliasFilePath, 'utf-8');
  return JSON.parse(aliasData);
};

// Función para extraer los fixtures desde el contenido del archivo
const extractFixtures = (fileReferences: string[]) => {
  const fixtures: string[] = [];

  fileReferences.forEach((file) => {
    const filePath = path.resolve(file);

    // Verificar si el archivo existe antes de intentar leerlo
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      // Buscar las sentencias cy.fixture
      const fixtureMatches = fileContent.match(/cy\.fixture\(['"]([^'"]+)['"]\)/g);
      if (fixtureMatches) {
        fixtureMatches.forEach((match) => {
          const fixturePath = match.match(/cy\.fixture\(['"]([^'"]+)['"]/);
          if (fixturePath && fixturePath[1]) {
            fixtures.push(fixturePath[1]);
          }
        });
      }
    } else {
      console.log(`Archivo no encontrado: ${filePath}`);
    }
  });

  return fixtures;
};

// Función principal para extraer las referencias de importación
const extractReferences = (testFile: string, aliasFilePath: string) => {
  const aliases = readAliases(aliasFilePath);
  const fileReferences: string[] = [];

  // Leer el contenido del archivo de prueba
  const testFilePath = path.resolve(testFile);
  const fileContent = fs.readFileSync(testFilePath, 'utf-8');

  // Buscar todas las importaciones en el archivo
  const importPattern = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;
  while ((match = importPattern.exec(fileContent)) !== null) {
    let importPath = match[1];

    // Resolver alias
    if (importPath.startsWith('@')) {
      const alias = importPath.split('/')[0];
      const aliasBase = aliases[alias];
      if (aliasBase) {
        importPath = importPath.replace(alias, aliasBase);
      } else {
        console.log(`Alias no encontrado: ${alias}`);
      }
    }

    // Agregar la referencia al array
    fileReferences.push(importPath);
  }

  const fixtures = extractFixtures(fileReferences);

  return { fileReferences, fixtures };
};

// Ejecución principal
const testFile = process.argv[2];  // Ruta del archivo de prueba
const aliasFilePath = '.aliases.json';  // Ruta del archivo de aliases

const { fileReferences, fixtures } = extractReferences(testFile, aliasFilePath);

console.log('Referencias extraídas:', fileReferences);
console.log('Fixtures extraídos:', fixtures);