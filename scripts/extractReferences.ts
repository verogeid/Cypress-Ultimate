import fs from "fs";
import path from "path";

// Paso 1: Leer aliases desde `.aliases.json`
function readAliases(filePath: string): Record<string, string> {
  const aliasesContent = fs.readFileSync(filePath, "utf-8");
  const aliases = JSON.parse(aliasesContent);
  return aliases;
}

// Paso 2: Extraer declaraciones de importación
function extractImports(filePath: string): string[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const importRegex = /import\s+.*\s+from\s+["']([^"']+)["'];/g;
  return [...fileContent.matchAll(importRegex)].map(match => match[1]);
}

// Paso 3: Resolver rutas de importación
function resolvePaths(imports: string[], aliases: Record<string, string>, baseDir: string): string[] {
  const resolvedPaths: string[] = [];

  for (const imp of imports) {
    let resolvedPath = imp;

    // Resolver rutas relativas
    if (imp.startsWith(".") || imp.startsWith("..")) {
      resolvedPath = path.resolve(baseDir, imp);
    }

    // Resolver alias
    if (imp.startsWith("@")) {
      const [alias, ...subPath] = imp.split("/");
      if (aliases[alias]) {
        resolvedPath = path.resolve(aliases[alias], subPath.join("/"));
      }
    }

    // Verificar si el archivo existe con extensión .ts o .js
    if (!resolvedPath.endsWith(".ts") && !resolvedPath.endsWith(".js")) {
      if (fs.existsSync(`${resolvedPath}.ts`)) resolvedPath += ".ts";
      else if (fs.existsSync(`${resolvedPath}.js`)) resolvedPath += ".js";
    }

    if (resolvedPath.includes("cypress/") && !resolvedPaths.includes(resolvedPath)) {
      resolvedPaths.push(resolvedPath);
    }
  }

  return resolvedPaths;
}

// Paso 4: Buscar `cy.fixture`
function findFixtures(files: string[]): string[] {
  const fixtureRegex = /cy\.fixture\(["']([^"']+)["']\)/g;
  const fixtures: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const matches = [...content.matchAll(fixtureRegex)].map(match => match[1]);
    fixtures.push(...matches);
  }

  return fixtures;
}

// Ejecución del script
function main(testFile: string, aliasesPath: string) {
  const baseDir = path.dirname(testFile);

  console.log("Leyendo aliases...");
  const aliases = readAliases(aliasesPath);

  console.log("Extrayendo importaciones...");
  const imports = extractImports(testFile);

  console.log("Resolviendo rutas...");
  const resolvedFiles = resolvePaths(imports, aliases, baseDir);

  console.log("Buscando 'cy.fixture'...");
  const fixtures = findFixtures(resolvedFiles);

  console.log("Archivos relevantes:");
  console.log(resolvedFiles);

  console.log("Fixtures encontrados:");
  console.log(fixtures);
}

// Ruta al archivo de prueba y aliases
const testFile = "cypress/e2e/Tests/API/Cards/GX3-5811-boardMembers.api.cy.ts";
const aliasesPath = ".aliases.json";

// Ejecutar el script
main(testFile, aliasesPath);