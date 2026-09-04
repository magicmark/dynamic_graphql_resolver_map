console.log('importing Baz');

export const resolvers = {
  Query: {
    baz: () => ({ id: '1', value: 42 }),
  },
};
