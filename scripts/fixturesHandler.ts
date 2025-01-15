import fs from 'fs';

export const addFixtureReferences = (filePath: string, references: Set<string>, allFiles: Set<string>, baseDir: string) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const fixtureRegex = /cy\.fixture\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = fixtureRegex.exec(fileContent)) !== null) {
    let fixturePath = match[1];

    // Rutas de fixtures con cypress/fixtures y extensión .json
    if (!fixturePath.startsWith('cypress/fixtures/')) {
      fixturePath = 'cypress/fixtures/' + fixturePath;
    }
    fixturePath = fixturePath + '.json';

    if (!allFiles.has(fixturePath)) {
      references.add(fixturePath);
      allFiles.add(fixturePath);
    }
  }
};

