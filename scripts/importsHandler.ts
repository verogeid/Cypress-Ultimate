import fs from 'fs';
import path from 'path';

export const addImportReferences = (
  testFile: string,
  fileReferences: Set<string>,
  allFiles: Set<string>,
  notFound: Set<string>,
  aliases: Record<string, string>,
  log: string[]
) => {
  console.log('Iniciando addImportReferences');
  
  const fileContent = fs.readFileSync(testFile, 'utf-8');
  
  const importRegex = /import\s+.*\s+from\s+["']([^"']+)["']/g;
  let match;
  
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];

    console.log(`Encontrada importación: ${importPath}`);
    
    // Resolver alias
    if (importPath.startsWith('@')) {
      const aliasName = importPath.split('/')[0];
      if (aliases[aliasName]) {
        importPath = importPath.replace(aliasName, aliases[aliasName]);
        console.log(`Alias encontrado. Ruta resuelta: ${importPath}`);
      } else {
        console.log(`Alias no encontrado para ${aliasName}`);
      }
    }

    // Resolver rutas relativas y absolutas
    if (!importPath.startsWith('http') && !importPath.startsWith('cypress')) {
      importPath = path.resolve(path.dirname(testFile), importPath);
      console.log(`Ruta relativa convertida a absoluta: ${importPath}`);
    }

    if (!allFiles.has(importPath)) {
      fileReferences.add(importPath);
      allFiles.add(importPath);
      console.log(`Ruta agregada: ${importPath}`);
    } else {
      console.log(`Ruta ya procesada: ${importPath}`);
    }
  }

  console.log('addImportReferences completado');
};

