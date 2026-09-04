import { readFileSync } from 'node:fs';
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import importMap from './resolver_import_map.json' with { type: 'json' };

const fooTypeDef = readFileSync(new URL('./types/Foo/Foo.graphql', import.meta.url), 'utf-8');
const barTypeDef = readFileSync(new URL('./types/Bar/Bar.graphql', import.meta.url), 'utf-8');
const bazTypeDef = readFileSync(new URL('./types/Baz/Baz.graphql', import.meta.url), 'utf-8');

const r = new Proxy(Object.create(null), {
  get(_, typeProp) {
    return new Proxy(Object.create(null), {
      get(_, fieldProp) {
        const schemaCoordinate = `${typeProp}.${fieldProp}`;
        if (!(schemaCoordinate in importMap)) return undefined;
        return async (parent, args, context, info) => {
          const { resolvers } = await import(importMap[schemaCoordinate]);
          const resolver = resolvers[typeProp][fieldProp];
          return resolver(parent, args, context, info);
        };
      }
    });
  },
});


const schema = makeExecutableSchema({
  typeDefs: ["type Query", fooTypeDef, barTypeDef, bazTypeDef],
  resolvers: r
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