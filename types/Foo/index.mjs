console.log('importing Foo');

export const resolvers = {
  Query: {
    foo: () => ({ id: '1', name: 'A Foo', priority: 'p3_low' }),
  },
  Priority: {
    LOW: 'p3_low',
    MEDIUM: 'p2_medium',
    HIGH: 'p1_high',
  },
};