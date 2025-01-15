import fs from 'fs';
import path from 'path';

// Función para verificar si un archivo existe
const checkFileExistence = (filePath: string): string | null => {
  return fs.existsSync(filePath) ? filePath : null;
};

// Función para extraer las importaciones de un archivo
export const addImportReferences = (
  file: string,
  fileReferences: Set<string>,
  allFiles: Set<string>,
  notFound: Set<string>
) => {
  const filePath = path.resolve(file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Buscar las sentencias de importación
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

    // Verificar si el archivo importado existe
    const resolvedPath = checkFileExistence(importPath);
    if (resolvedPath && !allFiles.has(resolvedPath)) {
      fileReferences.add(resolvedPath);
      allFiles.add(resolvedPath);
    } else {
      notFound.add(importPath);
    }
  }
};
