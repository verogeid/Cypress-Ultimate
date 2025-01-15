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
  const importPattern = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;

  // Buscar todas las rutas de importación en el archivo de pruebas
  while ((match = importPattern.exec(fileContent)) !== null) {
    let importPath = match[1];
    log.push(`Procesando importación: ${importPath}`);

    // Resolver alias
    if (importPath.startsWith('@')) {
      const alias = importPath.split('/')[0];
      const aliasBase = aliases[alias];

      if (aliasBase) {
        importPath = path.join(aliasBase, importPath.slice(alias.length));
        log.push(`Alias resuelto: ${importPath}`);
      } else {
        log.push(`Alias no encontrado para: ${importPath}`);
        continue; // Si no se encuentra alias, saltar
      }
    }

    // Comprobar si el archivo ya fue procesado
    if (!allFiles.has(importPath)) {
      allFiles.add(importPath);

      // Intentar añadir la extensión .ts
      let resolvedPath = `${importPath}.ts`;
      if (fs.existsSync(resolvedPath)) {
        fileReferences.add(resolvedPath);
        log.push(`Ruta añadida: ${resolvedPath}`);
      } else {
        // Si no existe .ts, intentar con .js
        resolvedPath = `${importPath}.js`;
        if (fs.existsSync(resolvedPath)) {
          fileReferences.add(resolvedPath);
          log.push(`Ruta añadida: ${resolvedPath}`);
        } else {
          // Si no existe, probar sin extensión
          resolvedPath = importPath;
          if (fs.existsSync(resolvedPath)) {
            fileReferences.add(resolvedPath);
            log.push(`Ruta añadida: ${resolvedPath}`);
          } else {
            // Si no se encuentra, marcar como no encontrado
            notFound.add(resolvedPath);
            log.push(`Ruta no encontrada: ${resolvedPath}`);
          }
        }
      }
    }
  }
};

export const addFixtureReferences = (
  testFile: string,
  fileReferences: Set<string>,
  log: string[]
) => {
  const fileContent = fs.readFileSync(testFile, 'utf-8');
  const fixturePattern = /fixtures\/(.*)/g;
  let match;

  // Buscar todas las rutas de fixtures en el archivo de pruebas
  while ((match = fixturePattern.exec(fileContent)) !== null) {
    const fixturePath = match[1];
    const resolvedPath = `cypress/fixtures/${fixturePath}.json`;

    // Si existe el archivo de fixture, añadirlo a las referencias
    if (fs.existsSync(resolvedPath)) {
      fileReferences.add(resolvedPath);
      log.push(`Fixture añadido: ${resolvedPath}`);
    } else {
      log.push(`Fixture no encontrado: ${resolvedPath}`);
    }
  }
};

