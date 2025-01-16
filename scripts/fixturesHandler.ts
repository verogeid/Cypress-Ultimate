import fs from 'fs';

export const addFixtureReferences = (
  filePath: string,
  references: Set<string>,
  allFiles: Set<string>,
  baseDir: string,
  log: string[]
) => {
  console.log('Iniciando addFixtureReferences');
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fixtureRegex = /cy\.fixture['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];

    console.log(`Encontrado fixture: ${fixturePath}`);
    
    // Rutas de fixtures con cypress/fixtures y extensión .json
    if (!fixturePath.startsWith('cypress/fixtures/')) {
      fixturePath = 'cypress/fixtures/' + fixturePath;
      console.log(`Ruta de fixture modificada: ${fixturePath}`);
    }
    fixturePath = fixturePath + '.json';

    if (!allFiles.has(fixturePath)) {
      references.add(fixturePath);
      allFiles.add(fixturePath);
      console.log(`Fixture agregado: ${fixturePath}`);
    } else {
      console.log(`Fixture ya procesado: ${fixturePath}`);
    }
  }

  console.log('addFixtureReferences completado');
};

