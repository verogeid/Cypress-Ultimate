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
  const fileContent = fs.readFileSync(testFile, 'utf-8');

  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];

    // Resolver alias
    if (importPath.startsWith('@')) {
      const aliasName = importPath.split('/')[0];
      const aliasBase = aliases[aliasName];
      if (aliasBase) {
        importPath = importPath.replace(aliasName, aliasBase);
        log.push(`Alias resuelto: ${aliasName} → ${aliasBase}`);
      } else {
        log.push(`Alias no encontrado: ${aliasName}`);
      }
    }

    // Resolver la ruta relativa
    let resolvedPath = path.resolve(path.dirname(testFile), importPath);

    // Comprobar si el archivo existe con .ts
    if (!fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.js')) {
      notFound.add(resolvedPath);
      log.push(`No se encontró: ${resolvedPath}`);
      continue;
    }

    if (fs.existsSync(resolvedPath + '.ts')) {
      resolvedPath = resolvedPath + '.ts';
    } else {
      resolvedPath = resolvedPath + '.js';
    }

    if (!allFiles.has(resolvedPath)) {
      fileReferences.add(resolvedPath);
      allFiles.add(resolvedPath);
      log.push(`Referencia añadida: ${resolvedPath}`);
    }
  }
};

