import fs from 'fs';
import path from 'path';

// Función para leer el archivo .aliases.json y convertirlo a un objeto
const readAliases = (aliasFilePath: string) => {
  const aliasData = fs.readFileSync(aliasFilePath, 'utf-8');
  console.log('Alias leídos:', aliasData);
  return JSON.parse(aliasData);
};

// Función principal para extraer las referencias de importación
export const addImportReferences = (fileContent: string, aliases: Record<string, string>) => {
  const fileReferences: string[] = [];

  // Buscar todas las importaciones en el archivo
  const importPattern = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;
  while ((match = importPattern.exec(fileContent)) !== null) {
    let importPath = match[1];
    console.log(`Importación encontrada: ${importPath}`);

    // Resolver alias
    if (importPath.startsWith('@')) {
      const alias = importPath.split('/')[0];
      const aliasBase = aliases[alias];
      if (aliasBase) {
        importPath = importPath.replace(alias, aliasBase);
        console.log(`Alias resuelto: ${importPath}`);
      } else {
        console.log(`Alias no encontrado para: ${alias}`);
      }
    }

    // Agregar la referencia al array
    fileReferences.push(importPath);
  }

  console.log('Referencias de importación:', fileReferences);
  return fileReferences;
};

// Función para extraer las referencias desde el archivo de prueba
export const extractReferences = (testFile: string, aliasFilePath: string) => {
  const aliases = readAliases(aliasFilePath);
  const testFilePath = path.resolve(testFile);
  console.log(`Leyendo archivo de prueba: ${testFilePath}`);

  const fileContent = fs.readFileSync(testFilePath, 'utf-8');
  const fileReferences = addImportReferences(fileContent, aliases);

  return fileReferences;
};

// Ejecución principal
const testFile = process.argv[2];  // Ruta del archivo de prueba
const aliasFilePath = '.aliases.json';  // Ruta del archivo de aliases

const fileReferences = extractReferences(testFile, aliasFilePath);
console.log('Referencias extraídas:', fileReferences);

