import fs from 'fs';
import path from 'path';

// Función para leer el archivo .aliases.json y convertirlo a un objeto
const readAliases = () => {
  const aliasFilePath = path.resolve(__dirname, '..', '.aliases.json');
  const aliasData = fs.readFileSync(aliasFilePath, 'utf-8');
  const aliases = JSON.parse(aliasData);
  return aliases;
};

// Función para resolver las rutas de los imports
const resolveImportPaths = (filePath: string, aliases: Record<string, string>) => {
  const fileReferences: string[] = [];

  // Leer el archivo de prueba y extraer las importaciones
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;

  while ((match = importRegex.exec(fileContent)) !== null) {
    let resolvedPath = match[1];

    // Resolver alias
    if (resolvedPath.startsWith('@')) {
      const aliasName = resolvedPath.split('/')[0];
      const aliasSubpath = resolvedPath.substring(aliasName.length);
      const aliasBase = aliases[aliasName];

      if (aliasBase) {
        resolvedPath = path.join(aliasBase, aliasSubpath);
      }
    }

    // Asegurarse de que la ruta sea relativa al repositorio
    resolvedPath = resolvedPath.replace(/^\.\//, '');

    if (resolvedPath.startsWith('cypress/')) {
      fileReferences.push(resolvedPath);
    }
  }

  return fileReferences;
};

// Función para extraer los fixtures desde el contenido del archivo
const extractFixtures = (fileReferences: string[]) => {
  const fixtures: string[] = [];

  fileReferences.forEach((file) => {
    const fileContent = fs.readFileSync(file, 'utf-8');
    const fixtureRegex = /cy\.fixture['"]([^'"]+)['"]/g;
    let match;

    while ((match = fixtureRegex.exec(fileContent)) !== null) {
      fixtures.push(match[1]);
    }
  });

  return fixtures;
};

// Función principal para ejecutar el script
const extractReferences = (testFile: string) => {
  const aliases = readAliases();
  const fileReferences = resolveImportPaths(testFile, aliases);
  const fixtures = extractFixtures(fileReferences);

  // Guardar el archivo de resultados
  const result = {
    testFile: testFile,
    fileReferences: fileReferences,
    fixtures: fixtures
  };

  const outputFile = 'extracted_references.json';
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

  console.log(`Referencias extraídas: ${JSON.stringify(result, null, 2)}`);
};

// Ejecutar el script con los parámetros de entrada
const testFile = process.argv[2];

extractReferences(testFile);

