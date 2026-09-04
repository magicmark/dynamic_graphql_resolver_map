# dynamic_graphql_resolver_map

GraphQL server with lazy-loaded resolvers. Each type lives in its own directory under `types/` and its resolver module is only imported when that field is first queried.

## Setup

```
npm install
npm run generate-import-map
```

## Run

```
npm run dev
```

Execute the following query:

```graphql
{
  bar {
    id
    label
  }
  foo {
    id
    name
  }
}

```

### ✨ Magic

Watch as resolver modules are lazily executed on-demand at runtime!

---

All credit to jack for this idea, this is a minimal proof of concept.