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
  log.push('Entering addImportReferences function');

  try {
    const fileContent = fs.readFileSync(testFile, 'utf-8');
    const importRegex = /import\s+.*\s+from\s+["']([^"']+)["']/g;
    let match;

    while ((match = importRegex.exec(fileContent)) !== null) {
      let importPath = match[1];

      log.push(`Found import path: ${importPath}`);

      // Resolver alias si es necesario
      if (importPath.startsWith('@')) {
        const aliasName = importPath.split('/')[0];
        const aliasTarget = aliases[aliasName];

        if (aliasTarget) {
          importPath = path.resolve(aliasTarget, importPath.slice(aliasName.length));
          log.push(`Resolved alias: ${importPath}`);
        } else {
          log.push(`Alias not found for: ${importPath}`);
        }
      }

      // Verificar si la ruta es válida
      if (fs.existsSync(importPath)) {
        if (!allFiles.has(importPath)) {
          fileReferences.add(importPath);
          allFiles.add(importPath);
        }
      } else {
        notFound.add(importPath);
        log.push(`Path not found: ${importPath}`);
      }
    }
  } catch (error: any) {
    log.push(`Error in addImportReferences: ${error.message}`);
    throw error;
  }

  log.push('Exiting addImportReferences function');
};

