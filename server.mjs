import { readFileSync } from 'node:fs';
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import importMap from './resolver_import_map.json' with { type: 'json' };

const fooTypeDef = readFileSync(new URL('./types/Foo/Foo.graphql', import.meta.url), 'utf-8');
const barTypeDef = readFileSync(new URL('./types/Bar/Bar.graphql', import.meta.url), 'utf-8');
const bazTypeDef = readFileSync(new URL('./types/Baz/Baz.graphql', import.meta.url), 'utf-8');

const dynamicResolvers = {};

for (const [coordinate, modulePath] of Object.entries(importMap)) {
  const [typeName, fieldName] = coordinate.split('.');
  dynamicResolvers[typeName] = dynamicResolvers[typeName] || {};
  dynamicResolvers[typeName][fieldName] = async (...args) => {
    const { resolvers } = await import(modulePath);
    return resolvers[typeName][fieldName](...args);
  };
}

const schema = makeExecutableSchema({
  typeDefs: ["type Query", fooTypeDef, barTypeDef, bazTypeDef],
  resolvers: dynamicResolvers,
});

const server = express()
  .all('/graphql', createHandler({ schema }))
  .use(express.static('.'))
  .listen(process.env.PORT ?? 4000, () => {
    const address = server.address();
    const host = address.address === '::' ? 'localhost' : address.address;
    const port = address.port;
    console.log(`\n   🐢 Server is running on http://${host}:${port} - have fun!`);
  });