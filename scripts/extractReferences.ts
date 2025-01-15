import fs from 'fs';
import path from 'path';
import { addImportReferences } from './importsHandler';
import { addFixtureReferences } from './fixturesHandler';

// Función principal para extraer las referencias de importación y fixtures
export const extractReferences = (
  testFile: string,
  aliasFilePath: string
) => {
  console.log(`Inicio de extracción de referencias para el archivo: ${testFile}`);
  console.log(`Leyendo aliases desde: ${aliasFilePath}`);

  // Leer y parsear los aliases
  let aliases = {};
  try {
    aliases = JSON.parse(fs.readFileSync(aliasFilePath, 'utf-8'));
    console.log(`Aliases cargados:`, aliases);
  } catch (error) {
    console.error(`Error al leer el archivo de aliases: ${aliasFilePath}`, error);
    return;
  }

  const fileReferences = new Set<string>();
  const allFiles = new Set<string>();
  const notFound = new Set<string>();

  // Agregar las referencias de importación
  console.log('Agregando referencias de importación...');
  try {
    addImportReferences(testFile, fileReferences, allFiles, notFound, aliases);
  } catch (error) {
    console.error('Error al agregar referencias de importación:', error);
  }

  // Agregar las referencias de fixtures
  console.log('Agregando referencias de fixtures...');
  try {
    addFixtureReferences(testFile, fileReferences);
  } catch (error) {
    console.error('Error al agregar referencias de fixtures:', error);
  }

  // Preparar el resultado
  const result = {
    fileReferences: Array.from(fileReferences),
    allFiles: Array.from(allFiles),
    notFound: Array.from(notFound),
  };

  console.log('Resultado de la extracción:', result);

  // Guardar las referencias en un archivo JSON
  const outputFile = 'extracted_references.json';
  try {
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`Referencias extraídas guardadas en ${outputFile}`);
  } catch (error) {
    console.error(`Error al escribir el archivo ${outputFile}:`, error);
  }

  return result;
};