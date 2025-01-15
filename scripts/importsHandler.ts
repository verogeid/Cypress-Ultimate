import fs from 'fs';
import path from 'path';

export const addImportReferences = (
  testFile: string,
  fileReferences: Set<string>,
  allFiles: Set<string>,
  notFound: Set<string>,
  aliases: { [key: string]: string }
) => {
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

    // Verificar existencia y agregar la referencia al array
    const resolvedPath = checkFileExistence(importPath);
    if (resolvedPath && !allFiles.has(resolvedPath)) {
      fileReferences.add(resolvedPath);
      allFiles.add(resolvedPath);
    } else {
      notFound.add(importPath);
    }
  }
};

// Función para verificar si un archivo existe
const checkFileExistence = (filePath: string): string | null => {
  return fs.existsSync(filePath) ? filePath : null;
};

