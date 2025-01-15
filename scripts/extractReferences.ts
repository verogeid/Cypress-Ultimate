import fs from 'fs';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

// Verifica la existencia de archivo con extensiones posibles
const checkFileExistence = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', ''];
  for (const ext of extensions) {
    const fullPath = filePath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
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

// Leer entrada de usuario
const testRunInput = process.argv[2];

extractReferences(testRunInput);

