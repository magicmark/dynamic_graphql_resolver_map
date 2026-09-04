console.log('importing Foo');

export const resolvers = {
  Query: {
    foo: () => ({ id: '1', name: 'A Foo' }),
  }
};