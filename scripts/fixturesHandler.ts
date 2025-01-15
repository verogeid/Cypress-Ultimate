import fs from 'fs';

export const addFixtureReferences = (
  filePath: string,
  references: Set<string>,
  allFiles: Set<string>,
  baseDir: string,
  log: string[]
) => {
  log.push(`Leyendo archivo: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const fixtureRegex = /cy\.fixture['"]([^'"]+)['"]/g;
  let match;
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];

    // Rutas de fixtures con cypress/fixtures y extensión .json
    if (!fixturePath.startsWith('cypress/fixtures/')) {
      fixturePath = 'cypress/fixtures/' + fixturePath;
      log.push(`Ruta de fixture corregida: ${fixturePath}`);
    }
    fixturePath = fixturePath + '.json';
    log.push(`Comprobando existencia del archivo fixture: ${fixturePath}`);

    if (!allFiles.has(fixturePath)) {
      references.add(fixturePath);
      allFiles.add(fixturePath);
      log.push(`Referencia añadida: ${fixturePath}`);
    } else {
      log.push(`Fixture ya procesado: ${fixturePath}`);
    }
  }
};

