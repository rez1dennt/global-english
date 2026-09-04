import test from 'node:test';
import assert from 'node:assert/strict';
await import('../assets/js/phone-mask.js');
const {
    extractRussianPhoneDigits,
    formatRussianPhone,
    isValidRussianPhone,
    editRussianPhone,
} = globalThis.GlobalEnglishPhone;

test('empty phone remains empty', () => {
    assert.equal(formatRussianPhone(''), '');
});

test('normalizes a leading 8 to Russian country code', () => {
    assert.equal(extractRussianPhoneDigits('8 (912) 345-67-89'), '79123456789');
});

test('prefixes country code for a pasted ten-digit number', () => {
    assert.equal(formatRussianPhone('9123456789'), '+7 (912) 345-67-89');
});

test('formats partial phone without inventing digits', () => {
    assert.equal(formatRussianPhone('+7 (912) 34'), '+7 (912) 34');
});

test('removes non-digit characters', () => {
    assert.equal(formatRussianPhone('8 call 999 abc 123 45 67'), '+7 (999) 123-45-67');
});

test('deletes the digit immediately after the closing parenthesis', () => {
    const result = editRussianPhone('+7 (912) 345-67-89', 9, 9, 'deleteContentForward', '');
    assert.equal(result.value, '+7 (912) 456-78-9');
});

test('backspace deletes the area-code digit instead of restoring punctuation', () => {
    const result = editRussianPhone('+7 (912) 345-67-89', 8, 8, 'deleteContentBackward', '');
    assert.equal(result.value, '+7 (913) 456-78-9');
});

test('selection replacement preserves following digits', () => {
    const result = editRussianPhone('+7 (912) 345-67-89', 4, 8, 'insertText', '999');
    assert.equal(result.value, '+7 (999) 345-67-89');
});

test('accepts only a complete Russian phone', () => {
    assert.equal(isValidRussianPhone('+7 (912) 345-67-89'), true);
    assert.equal(isValidRussianPhone('+7 (912) 34'), false);
});
