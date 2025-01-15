import fs from 'fs';
import path from 'path';

// Ruta del archivo de pruebas proporcionada como input
const testFilePath = process.argv[2];  // Aquí es donde tomaríamos el valor de la entrada 'test_run' en el workflow

// Verificar si el archivo de pruebas existe
if (!fs.existsSync(testFilePath)) {
  console.error(`Archivo de pruebas no encontrado: ${testFilePath}`);
  process.exit(1);  // Salir si el archivo no se encuentra
}

// Guardar la ruta del archivo de pruebas en las referencias
let allReferences: string[] = [testFilePath];  // Inicializamos con el archivo de pruebas

// Función para comprobar la existencia de archivos con diferentes extensiones
const checkFileExists = (filePath: string): string | null => {
  const extensions = ['.ts', '.js', ''];
  for (const ext of extensions) {
    const fileWithExt = ext ? filePath + ext : filePath;
    if (fs.existsSync(fileWithExt)) {
      return fileWithExt;
    }
  }
  return null;
};

// Función recursiva para procesar el archivo de pruebas y las importaciones
const processImportsAndFixtures = (filePath: string): void => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Buscar todas las sentencias de import
  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];
    
    // Comprobar si es una ruta relativa y convertirla a la ruta de cypress/
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      importPath = path.resolve(path.dirname(filePath), importPath);
    } else if (importPath.startsWith('@')) {
      importPath = importPath.replace('@', 'cypress/'); // Aquí añadimos el prefijo cypress/ a los alias
    }

    // Comprobar si el archivo existe con .ts, .js o sin extensión
    const validPath = checkFileExists(importPath);
    if (validPath && !allReferences.includes(validPath)) {
      allReferences.push(validPath);
      // Llamada recursiva para procesar el archivo importado
      processImportsAndFixtures(validPath);
    }
  }

  // Buscar todas las sentencias cy.fixture
  const fixtureRegex = /cy\.fixture\(['"](.*)['"]\)/g;
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];
    
    // Asegurarnos de que la ruta comienza con cypress/fixtures
    if (!fixturePath.startsWith('cypress/fixtures')) {
      fixturePath = 'cypress/fixtures/' + fixturePath;
    }
    
    // Añadir la extensión .json a las rutas de fixture
    if (!fixturePath.endsWith('.json')) {
      fixturePath += '.json';
    }

    // Verificar si el archivo de fixture existe
    const validFixturePath = checkFileExists(fixturePath);
    if (validFixturePath && !allReferences.includes(validFixturePath)) {
      allReferences.push(validFixturePath);
    }
  }
};

// Comenzamos con el archivo de pruebas
processImportsAndFixtures(testFilePath);

// Guardar las rutas de archivos en un archivo JSON
const result = { fileReferences: allReferences };
fs.writeFileSync('extracted_references.json', JSON.stringify(result, null, 2));

console.log('Referencias extraídas completadas');