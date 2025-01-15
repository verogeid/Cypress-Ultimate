limport fs from 'fs';
import path from 'path';

// Verifica la existencia de archivo con extensiones posibles
const checkFileExistence = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', ''];
  for (const ext of extensions) {
    const fullPath = filePath.endsWith(ext) ? filePath : filePath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

// Agregar rutas de las importaciones
export const addImportReferences = (filePath: string, references: Set<string>, allFiles: Set<string>, notFound: Set<string>) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(fileContent)) !== null) {
    let importedPath = match[1];

    // Resolver rutas relativas y absolutas
    if (importedPath.startsWith('.')) {
      importedPath = path.resolve(path.dirname(filePath), importedPath);
    } else if (importedPath.startsWith('@')) {
      importedPath = importedPath.replace('@', 'cypress/');
    }

    // Verificar existencia del archivo con extensión adecuada
    const resolvedPath = checkFileExistence(importedPath);
    if (resolvedPath && !allFiles.has(resolvedPath)) {
      references.add(resolvedPath);
      allFiles.add(resolvedPath);
    } else {
      notFound.add(importedPath);
    }
  }
};

