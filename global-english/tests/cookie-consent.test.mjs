import test from 'node:test';
import assert from 'node:assert/strict';

await import('../assets/js/cookie-consent.js');

const { CONSENT_KEY, readConsent, writeConsent, clearConsent } = globalThis.GlobalEnglishCookie;

function createStorage(seed = {}) {
    const values = new Map(Object.entries(seed));
    return {
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, String(value)); },
        removeItem(key) { values.delete(key); },
    };
}

test('returns null when no cookie choice exists', () => {
    assert.equal(readConsent(createStorage()), null);
});

test('returns only supported consent values', () => {
    assert.equal(readConsent(createStorage({ [CONSENT_KEY]: 'all' })), 'all');
    assert.equal(readConsent(createStorage({ [CONSENT_KEY]: 'necessary' })), 'necessary');
    assert.equal(readConsent(createStorage({ [CONSENT_KEY]: 'unexpected' })), null);
});

test('writes and returns the chosen consent value', () => {
    const storage = createStorage();
    assert.equal(writeConsent(storage, 'all'), 'all');
    assert.equal(readConsent(storage), 'all');
});

test('rejects unsupported values without writing them', () => {
    const storage = createStorage();
    assert.throws(() => writeConsent(storage, 'marketing'), /Unsupported cookie consent/);
    assert.equal(readConsent(storage), null);
});

test('clears the stored choice for reopening settings', () => {
    const storage = createStorage({ [CONSENT_KEY]: 'necessary' });
    clearConsent(storage);
    assert.equal(readConsent(storage), null);
});
