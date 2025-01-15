import fs from 'fs';
import path from 'path';

// Verifica la existencia de archivo
const checkFileExistence = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', ''];
  for (const ext of extensions) {
    const fullPath = path.resolve(filePath + ext);
    if (fs.existsSync(fullPath)) {
      return filePath + ext;
    }
  }
  return null;
};

// Agregar rutas de las importaciones
export const addImportReferences = (
  filePath: string,
  references: Set<string>,
  allFiles: Set<string>
) => {
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

