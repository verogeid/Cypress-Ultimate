import fs from 'fs';

export const addFixtureReferences = (
  filePath: string,
  references: Set<string>,
  allFiles: Set<string>,
  baseDir: string,
  log: string[]
) => {
  log.push(`Starting addFixtureReferences for ${filePath}`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fixtureRegex = /cy\.fixture['"]([^'"]+)['"]/g;
    let match;

    while ((match = fixtureRegex.exec(fileContent)) !== null) {
      let fixturePath = match[1];
      log.push(`Found fixture: ${fixturePath}`);

      // Rutas de fixtures con cypress/fixtures y extensión .json
      if (!fixturePath.startsWith('cypress/fixtures/')) {
        fixturePath = 'cypress/fixtures/' + fixturePath;
      }
      fixturePath = fixturePath + '.json';

      if (!allFiles.has(fixturePath)) {
        references.add(fixturePath);
        allFiles.add(fixturePath);
        log.push(`Added fixture reference: ${fixturePath}`);
      }
    }

    log.push('Finished addFixtureReferences');
  } catch (error) {
    log.push(`Error in addFixtureReferences: ${error.message}`);
    throw error;
  }
};
