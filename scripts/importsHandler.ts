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
  log.push(`Starting addImportReferences for ${testFile}`);

  try {
    const fileContent = fs.readFileSync(testFile, 'utf-8');
    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"];/g;
    let match;

    while ((match = importRegex.exec(fileContent)) !== null) {
      let importPath = match[1];
      log.push(`Found import: ${importPath}`);

      // Resolver rutas de alias
      if (importPath.startsWith('@')) {
        const aliasName = importPath.split('/')[0];
        const aliasBase = aliases[aliasName];

        if (aliasBase) {
          importPath = path.join(aliasBase, importPath.slice(aliasName.length));
          log.push(`Resolved alias: ${importPath}`);
        } else {
          log.push(`Alias not found for ${aliasName}`);
          notFound.add(importPath);
        }
      }

      // Resolver rutas relativas o absolutas
      if (!allFiles.has(importPath)) {
        fileReferences.add(importPath);
        allFiles.add(importPath);
        log.push(`Added reference: ${importPath}`);
      }
    }
    log.push('Finished addImportReferences');
  } catch (error) {
    log.push(`Error in addImportReferences: ${error.message}`);
    throw error;
  }
};
