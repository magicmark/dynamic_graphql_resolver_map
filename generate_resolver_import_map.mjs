import { readFileSync, readdirSync, statSync } from 'node:fs';
import { parse } from 'acorn';
import { join } from 'node:path';

const typesDir = new URL('./types/', import.meta.url);
const importMap = {};

for (const entry of readdirSync(typesDir)) {
  const dir = join(typesDir.pathname, entry);
  if (!statSync(dir).isDirectory()) continue;

  const resolverPath = join(dir, 'index.mjs');
  try {
    readFileSync(resolverPath);
  } catch {
    continue;
  }

  const source = readFileSync(resolverPath, 'utf-8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });

  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration') continue;
    const decl = node.declaration;
    if (!decl || decl.type !== 'VariableDeclaration') continue;

    for (const declarator of decl.declarations) {
      if (declarator.id.name !== 'resolvers') continue;
      const obj = declarator.init;
      if (obj.type !== 'ObjectExpression') continue;

      for (const typeProp of obj.properties) {
        const typeName = typeProp.key.name ?? typeProp.key.value;
        const fieldObj = typeProp.value;
        if (fieldObj.type !== 'ObjectExpression') continue;

        for (const fieldProp of fieldObj.properties) {
          const fieldName = fieldProp.key.name ?? fieldProp.key.value;
          const coordinate = `${typeName}.${fieldName}`;
          if (importMap[coordinate]) {
            throw new Error(`duplicate resolver: ${coordinate} defined in both ${importMap[coordinate].path} and ./types/${entry}/index.mjs`);
          }
          const isFunc = fieldProp.value.type === 'ArrowFunctionExpression' || fieldProp.value.type === 'FunctionExpression';
          importMap[coordinate] = { path: `./types/${entry}/index.mjs`, isFunc };
        }
      }
    }
  }
}

console.log(JSON.stringify(importMap, null, 2));
