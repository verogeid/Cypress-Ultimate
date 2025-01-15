import fs from 'fs';
import path from 'path';

// Verifica la existencia de archivo
const checkFileExistence = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', ''];
  for (const ext of extensions) {
    const fullPath = path.resolve(filePath + ext);
    console.log(`Comprobando existencia del archivo: ${fullPath}`); // Depuración: ver la ruta completa
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

// Agregar rutas de las importaciones
const addImportReferences = (filePath: string, references: Set<string>, allFiles: Set<string>) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importedPath = match[1];

    // Resolver rutas relativas
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

// Agregar rutas de las fixtures
const addFixtureReferences = (filePath: string, references: Set<string>, allFiles: Set<string>) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const fixtureRegex = /cy\.fixture\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];

    // Rutas de fixtures con cypress/fixtures y extensión .json
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

// Leer y extraer las referencias
const extractReferences = (testFile: string): void => {
  const references: Set<string> = new Set();
  const allFiles: Set<string> = new Set();

  // Archivo de pruebas inicial
  const resolvedTestFile = checkFileExistence(testFile);
  if (resolvedTestFile) {
    references.add(resolvedTestFile);
    allFiles.add(resolvedTestFile);

    // Buscar import y fixtures en el archivo de pruebas
    addImportReferences(resolvedTestFile, references, allFiles);
    addFixtureReferences(resolvedTestFile, references, allFiles);

    // Iterar sobre referencias encontradas
    const filesToProcess = Array.from(references);
    for (const file of filesToProcess) {
      addImportReferences(file, references, allFiles);
      addFixtureReferences(file, references, allFiles);
    }
  }

  // Guardamos referencias en archivo JSON
  const referencesList = Array.from(references);
  fs.writeFileSync('extracted_references.json', JSON.stringify({ fileReferences: referencesList }, null, 2));
};

const testRunInput = process.argv[2];

extractReferences(testRunInput);

