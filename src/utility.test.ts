import { parseUrl } from './utility';

test('parseUrl', () => {
    const parsed = parseUrl('http://abc.com/def/ghi.ext?qry=qqq');
    expect(parsed.domain).toBe('abc.com');
    expect(parsed.path).toBe('def/ghi.ext');
    expect(parsed.queryString).toBe('qry=qqq');
    expect(parsed.resourceName).toBe('ghi');
    expect(parsed.resourceExtension).toBe('ext');
});