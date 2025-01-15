import fs from 'fs';
import path from 'path';

// Función para agregar referencias de importación desde un archivo de prueba
export const addImportReferences = (
  testFile: string,
  fileReferences: Set<string>,
  allFiles: Set<string>,
  notFound: Set<string>,
  aliases: Record<string, string>
) => {
  // Leer el contenido del archivo de prueba
  const fileContent = fs.readFileSync(testFile, 'utf-8');

  // Extraer las rutas de las sentencias import
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];
    let resolvedPath: string | null = null;

    // Resolver alias
    if (importPath.startsWith('@')) {
      const alias = importPath.split('/')[0];
      const aliasBase = aliases[alias];
      if (aliasBase) {
        const relativePath = importPath.replace(alias, aliasBase);
        resolvedPath = path.resolve(path.dirname(testFile), relativePath);
      }
    } else if (importPath.startsWith('.') || importPath.startsWith('/')) {
      // Resolver rutas relativas o absolutas
      resolvedPath = path.resolve(path.dirname(testFile), importPath);
    }

    // Probar con .ts, .js y la ruta directa
    if (resolvedPath) {
      if (fs.existsSync(`${resolvedPath}.ts`)) {
        resolvedPath = `${resolvedPath}.ts`;
      } else if (fs.existsSync(`${resolvedPath}.js`)) {
        resolvedPath = `${resolvedPath}.js`;
      } else if (!fs.existsSync(resolvedPath)) {
        notFound.add(resolvedPath);
        console.log(`Archivo no encontrado: ${resolvedPath}`);
        continue;
      }

      // Convertir a ruta relativa al repositorio
      const repoRelativePath = path.relative(process.cwd(), resolvedPath);
      if (!fileReferences.has(repoRelativePath)) {
        fileReferences.add(repoRelativePath);
        allFiles.add(repoRelativePath);
        console.log(`Archivo procesado: ${repoRelativePath}`);

        // Llamar recursivamente para analizar el siguiente archivo
        addImportReferences(resolvedPath, fileReferences, allFiles, notFound, aliases);
      }
    }
  }
};

