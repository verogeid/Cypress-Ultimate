import fs from 'fs';
import path from 'path';

// Función para extraer las rutas de importación
const extractImports = (testFile: string, aliases: Record<string, string>, repoBasePath: string) => {
  const fileReferences: string[] = [];

  // Leer el contenido del archivo de prueba
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

    // Intentar con .ts, .js, o sin extensión
    const pathsToTry = [
      `${importPath}.ts`,  // Intentamos con .ts
      `${importPath}.js`,  // Intentamos con .js
      importPath,          // Intentamos sin extensión
    ];

    let foundPath = null;
    for (const candidate of pathsToTry) {
      // Ajustar ruta a la estructura relativa al repositorio
      if (candidate.startsWith('cypress/')) {
        const relativePath = path.relative(repoBasePath, path.resolve(candidate));
        if (checkFileExistence(relativePath, repoBasePath)) {
          foundPath = relativePath;
          break;
        }
      }
    }

    if (foundPath) {
      fileReferences.push(foundPath);
    } else {
      console.log(`No se encontró el archivo para la ruta: ${importPath}`);
    }
  }

  return fileReferences;
};

// Función para agregar rutas relevantes de importación
const addImportPath = (importPath: string, allFiles: Set<string>, references: Set<string>, notFound: Set<string>, repoBasePath: string) => {
  let foundPath = null;

  // Intentamos con .ts, .js, o sin extensión
  const pathsToTry = [
    `${importPath}.ts`,  // Intentamos con .ts
    `${importPath}.js`,  // Intentamos con .js
    importPath,          // Intentamos sin extensión
  ];

  for (const candidate of pathsToTry) {
    const resolvedPath = checkFileExistence(candidate, repoBasePath);
    if (resolvedPath && !allFiles.has(resolvedPath)) {
      references.add(resolvedPath);
      allFiles.add(resolvedPath);
      foundPath = resolvedPath;
      break;
    }
  }

  if (!foundPath) {
    notFound.add(importPath);
    console.log(`No se encontró el archivo para la ruta: ${importPath}`);
  }
};

// Función para verificar si un archivo existe
const checkFileExistence = (importedPath: string, repoBasePath: string): string | null => {
  const filePath = path.resolve(repoBasePath, importedPath);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
};

export { extractImports, addImportPath };

