import fs from 'fs';
import path from 'path';

// Función que verifica la existencia de un archivo con diferentes extensiones
const checkFileExistence = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', '']; // Comprobar .ts, .js y sin extensión
  for (const ext of extensions) {
    const fullPath = path.resolve(filePath + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

// Función para agregar las rutas de las importaciones
const addImportReferences = (filePath: string, references: Set<string>, allFiles: Set<string>) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importedPath = match[1];

    // Si es una ruta relativa, resolvemos en relación con el archivo actual
    if (importedPath.startsWith('.')) {
      importedPath = path.resolve(path.dirname(filePath), importedPath);
    } else if (importedPath.startsWith('@')) {
      importedPath = importedPath.replace('@', 'cypress/');
    }

    importedPath = checkFileExistence(importedPath) || importedPath;

    if (importedPath && !allFiles.has(importedPath)) {
      references.add(importedPath);
      allFiles.add(importedPath);
    }
  }
};

// Función para agregar las rutas de las fixtures
const addFixtureReferences = (filePath: string, references: Set<string>, allFiles: Set<string>) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const fixtureRegex = /cy\.fixture['"]([^'"]+)['"]/g;
  let match;
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];

    // Asegurar que las rutas de fixtures comiencen con cypress/fixtures y tengan la extensión .json
    if (!fixturePath.startsWith('cypress/fixtures/')) {
      fixturePath = 'cypress/fixtures/' + fixturePath;
    }
    fixturePath = fixturePath + '.json';

    if (!allFiles.has(fixturePath)) {
      references.add(fixturePath);
      allFiles.add(fixturePath);
    }
  }
};

// Función principal para leer y extraer las referencias
const extractReferences = (testFile: string): void => {
  const references: Set<string> = new Set();
  const allFiles: Set<string> = new Set();

  // Primero, procesamos el archivo de pruebas inicial
  const resolvedTestFile = checkFileExistence(testFile);
  if (resolvedTestFile) {
    references.add(resolvedTestFile);
    allFiles.add(resolvedTestFile);

    // Buscar importaciones y fixtures en el archivo de pruebas
    addImportReferences(resolvedTestFile, references, allFiles);
    addFixtureReferences(resolvedTestFile, references, allFiles);

    // Iterar sobre las referencias encontradas para buscar más importaciones y fixtures
    const filesToProcess = Array.from(references);
    for (const file of filesToProcess) {
      addImportReferences(file, references, allFiles);
      addFixtureReferences(file, references, allFiles);
    }
  }

  // Guardamos las referencias en un archivo JSON
  const referencesList = Array.from(references);
  fs.writeFileSync('extracted_references.json', JSON.stringify({ fileReferences: referencesList }, null, 2));
};

const testRunInput = process.argv[2];

extractReferences(testRunInput);

