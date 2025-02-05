const FragmentDB = require('../../src/model/data/memory/index');

describe('Fragments-db-calls', () => {
  test('Write Fragment', async () => {
    const fragment = { ownerId: 'user123', id: 'frag1' };
    await FragmentDB.writeFragment(fragment);
    const storedFragment = await FragmentDB.readFragment(fragment.ownerId, fragment.id);
    expect(storedFragment).toEqual(fragment);
  });

  test('Read Fragment', async () => {
    const storedFragment = await FragmentDB.readFragment('user123', 'frag1');
    expect(storedFragment).toEqual({ ownerId: 'user123', id: 'frag1' });
  });

  test('Write Fragment Data using Buffer', async () => {
    const fragment = { ownerId: 'user123', id: 'frag1', data: Buffer.from('some data') };
    await FragmentDB.writeFragmentData(fragment.ownerId, fragment.id, fragment.data);
    const storedData = await FragmentDB.readFragmentData(fragment.ownerId, fragment.id);
    expect(storedData).toEqual(fragment.data);
  });

  test('Read Fragment Data using Buffer', async () => {
    const data = Buffer.from('some data');
    const storedData = await FragmentDB.readFragmentData('user123', 'frag1');
    expect(storedData).toEqual(data);
  });

  test('Check if getting list of fragments returns array, expand=false', async () => {
    const storedData = await FragmentDB.listFragments('user123');
    expect(Array.isArray(storedData)).toBe(true);
  });

  test('Get list of fragments, expand=false', async () => {
    const storedData = await FragmentDB.listFragments('user123');
    expect(storedData).toEqual(['frag1']);
  });

  test('Get list of fragments, expand=true', async () => {
    const fragment = { ownerId: 'user123', id: 'frag1', data: Buffer.from('some data') };
    await FragmentDB.writeFragmentData(fragment.ownerId, fragment.id, fragment.data);
    const storedMetaData = await FragmentDB.listFragments('user123', true);
    const storedData = await FragmentDB.readFragmentData('user123', 'frag1');
    expect(storedMetaData).toEqual([{ ownerId: 'user123', id: 'frag1' }]);
    expect(storedData).toEqual(Buffer.from('some data'));
    // console.log(storedMetaData);
    // console.log(storedData.toString());
  });

  test("Delete a fragment's metadata", async () => {
    const storedData = await FragmentDB.listFragments('user123');
    expect(storedData).toEqual(['frag1']);
    await FragmentDB.deleteFragment('user123', 'frag1');
    const storedData2 = await FragmentDB.listFragments('user123');
    expect(storedData2).toEqual([]);
  });
});
