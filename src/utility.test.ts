import { parseUrl, union, cloneAlongPath } from './utility';

test('parseUrl', () => {
    const parsed = parseUrl('http://abc.com/def/ghi.ext?qry=qqq');
    expect(parsed.domain).toBe('abc.com');
    expect(parsed.path).toBe('def/ghi.ext');
    expect(parsed.queryString).toBe('qry=qqq');
    expect(parsed.resourceName).toBe('ghi');
    expect(parsed.resourceExtension).toBe('ext');
});

describe('union', () => {
    test('merges elements from the second array', () => {
        expect(union(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
    });
    test('keeps all of the first array', () => {
        expect(union(['a', 'b'], [])).toEqual(['a', 'b']);
    });
    test('adds a wholly disjoint second array', () => {
        expect(union(['a'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
    });
});

describe('cloneAlongPath', () => {
    test('clones only the nodes on the path, sharing siblings', () => {
        const root = { a: { x: 1 }, b: { y: 2 } };
        const clone = cloneAlongPath(root, ['a']) as typeof root;
        expect(clone).not.toBe(root);
        expect(clone.a).not.toBe(root.a); // on the path -> cloned
        expect(clone.b).toBe(root.b);      // off the path -> shared reference
        expect(clone).toEqual(root);
    });
    test('does not mutate the original when the clone is edited', () => {
        const root = { a: { x: 1 } };
        const clone = cloneAlongPath(root, ['a']) as typeof root;
        clone.a.x = 99;
        expect(root.a.x).toBe(1);
    });
    test('stops at missing nodes without throwing', () => {
        const root = { a: { x: 1 } };
        const clone = cloneAlongPath(root, ['a', 'missing', 'deep']);
        expect(clone).toEqual(root);
    });
});