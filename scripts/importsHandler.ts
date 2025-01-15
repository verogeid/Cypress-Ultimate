import fs from 'fs';
import path from 'path';

export const addImportReferences = (
  testFile: string,
  fileReferences: Set<string>,
  allFiles: Set<string>,
  notFound: Set<string>,
  aliases: Record<string, string>,
  log: string[] = []
) => {
  const fileContent = fs.readFileSync(testFile, 'utf-8');
  
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];

    // Resolver alias
    if (importPath.startsWith('@')) {
      const aliasName = importPath.split('/')[0];
      const aliasPath = aliases[aliasName];
      if (aliasPath) {
        importPath = path.resolve(aliasPath, importPath.slice(aliasName.length));
        log.push(`Alias resuelto: ${importPath}`);
      } else {
        log.push(`Alias no encontrado: ${aliasName}`);
      }
    }

    // Asegurarse de que la ruta de importación sea relativa a la raíz del repositorio
    if (!importPath.startsWith('cypress/')) {
      importPath = path.join('cypress', importPath);
    }
    importPath = importPath.endsWith('.ts') || importPath.endsWith('.js') ? importPath : importPath + '.ts';

    if (!allFiles.has(importPath)) {
      const fileExists = fs.existsSync(importPath);
      if (fileExists) {
        fileReferences.add(importPath);
        allFiles.add(importPath);
        log.push(`Archivo encontrado: ${importPath}`);
      } else {
        notFound.add(importPath);
        log.push(`Archivo no encontrado: ${importPath}`);
      }
    }
  }
};

