import test from 'node:test';
import assert from 'node:assert/strict';

await import('../assets/js/scroll-lock.js');

const { getScrollbarGap, createScrollLock, getSharedScrollLock } = globalThis.GlobalEnglishScrollLock;

function createClassList() {
    const values = new Set();
    return {
        add(value) { values.add(value); },
        remove(value) { values.delete(value); },
        contains(value) { return values.has(value); },
    };
}

function createEnvironment() {
    const body = {
        style: { top: '1px', paddingRight: '4px' },
        classList: createClassList(),
    };
    const header = { style: { paddingRight: '2px' } };
    const document = {
        body,
        documentElement: { clientWidth: 1183 },
        querySelector(selector) { return selector === '[data-site-header]' ? header : null; },
    };
    const scrollCalls = [];
    const window = {
        innerWidth: 1200,
        scrollY: 420,
        getComputedStyle(element) {
            return { paddingRight: element === body ? '12px' : '8px' };
        },
        scrollTo(options) { scrollCalls.push(options); },
    };
    return { body, header, document, window, scrollCalls };
}

test('calculates only a positive scrollbar gap', () => {
    assert.equal(getScrollbarGap(1200, 1183), 17);
    assert.equal(getScrollbarGap(1200, 1200), 0);
    assert.equal(getScrollbarGap(1180, 1200), 0);
});

test('compensates body and fixed header while preserving owned styles', () => {
    const environment = createEnvironment();
    const lock = createScrollLock(environment.window, environment.document);

    assert.equal(lock.lock(), 420);
    assert.equal(lock.isLocked(), true);
    assert.equal(environment.body.style.top, '-420px');
    assert.equal(environment.body.style.paddingRight, '29px');
    assert.equal(environment.header.style.paddingRight, '25px');
    assert.equal(environment.body.classList.contains('menu-open'), true);

    lock.unlock();
    assert.equal(lock.isLocked(), false);
    assert.deepEqual(environment.body.style, { top: '1px', paddingRight: '4px' });
    assert.equal(environment.header.style.paddingRight, '2px');
    assert.equal(environment.body.classList.contains('menu-open'), false);
    assert.deepEqual(environment.scrollCalls, [{ top: 420, left: 0, behavior: 'instant' }]);
});

test('keeps the page locked until every layer releases ownership', () => {
    const environment = createEnvironment();
    const lock = createScrollLock(environment.window, environment.document);

    lock.lock();
    lock.lock();
    lock.unlock();

    assert.equal(lock.isLocked(), true);
    assert.equal(environment.body.classList.contains('menu-open'), true);
    assert.equal(environment.body.style.paddingRight, '29px');
    assert.deepEqual(environment.scrollCalls, []);

    lock.unlock();
    assert.equal(lock.isLocked(), false);
    assert.equal(environment.body.classList.contains('menu-open'), false);
    assert.deepEqual(environment.scrollCalls, [{ top: 420, left: 0, behavior: 'instant' }]);
});

test('returns one shared lock for the same document', () => {
    const environment = createEnvironment();
    assert.equal(
        getSharedScrollLock(environment.window, environment.document),
        getSharedScrollLock(environment.window, environment.document)
    );
});
