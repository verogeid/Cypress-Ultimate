import fs from 'fs';
import path from 'path';

// Función para leer el archivo .aliases.json y convertirlo a un objeto
const readAliases = (aliasFilePath: string) => {
  const aliasData = fs.readFileSync(aliasFilePath, 'utf-8');
  return JSON.parse(aliasData);
};

// Resolver rutas relativas y normalizar extensiones
const resolveImportPath = (importPath: string, basePath: string, aliases: Record<string, string>) => {
  // Resolver alias
  if (importPath.startsWith('@')) {
    const alias = importPath.split('/')[0];
    const aliasBase = aliases[alias];
    if (aliasBase) {
      importPath = path.join(aliasBase, importPath.replace(`${alias}/`, ''));
    }
  }

  // Resolver rutas relativas
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    importPath = path.resolve(path.dirname(basePath), importPath);
  }

  // Asegurarse de que se añada la extensión .ts o .js para los imports
  if (!path.extname(importPath)) {
    if (fs.existsSync(`${importPath}.ts`)) importPath += '.ts';
    else if (fs.existsSync(`${importPath}.js`)) importPath += '.js';
  }

  // Asegurarse de que la ruta comience con 'cypress/' o una ruta paralela
  if (importPath.includes('cypress/')) {
    return path.relative(process.cwd(), importPath);
  }

  return null; // Ignorar rutas fuera del alcance relevante
};

// Función para extraer los fixtures desde el contenido del archivo
const extractFixtures = (fileReferences: string[]) => {
  const fixtures: string[] = [];

  fileReferences.forEach((file) => {
    const filePath = path.resolve(file);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fixtureMatches = fileContent.match(/cy\.fixture\(['"]([^'"]+)['"]\)/g);
      if (fixtureMatches) {
        fixtureMatches.forEach((match) => {
          const fixturePath = match.match(/cy\.fixture\(['"]([^'"]+)['"]/);
          if (fixturePath && fixturePath[1]) {
            const fixtureResolved = path.resolve('cypress', 'fixtures', fixturePath[1] + '.json');
            if (fs.existsSync(fixtureResolved)) {
              fixtures.push(path.relative(process.cwd(), fixtureResolved));
            }
          }
        });
      }
    } else {
      console.log(`Archivo no encontrado: ${filePath}`);
    }
  });

  return fixtures;
};

// Función principal para extraer las referencias de importación
const extractReferences = (testFile: string, aliasFilePath: string) => {
  const aliases = readAliases(aliasFilePath);
  const fileReferences: string[] = [];

  const testFilePath = path.resolve(testFile);
  const fileContent = fs.readFileSync(testFilePath, 'utf-8');

  const importPattern = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;
  while ((match = importPattern.exec(fileContent)) !== null) {
    const importPath = resolveImportPath(match[1], testFilePath, aliases);
    if (importPath) {
      fileReferences.push(importPath);
    }
  }

  // Agregar los fixtures encontrados
  const fixtures = extractFixtures(fileReferences);

  // Unir imports y fixtures en una sola lista de rutas
  const allReferences = [...fileReferences, ...fixtures];

  // Guardar los resultados en el archivo JSON
  const result = { fileReferences: allReferences };
  fs.writeFileSync('extracted_references.json', JSON.stringify(result, null, 2));

  return result;
};

// Ejecución principal
const testFile = process.argv[2] || 'cypress/e2e/Tests/API/Cards/GX3-5811-boardMembers.api.cy.ts';
const aliasFilePath = '.aliases.json';

const { fileReferences } = extractReferences(testFile, aliasFilePath);

console.log('Referencias extraídas:', JSON.stringify(fileReferences, null, 2));

