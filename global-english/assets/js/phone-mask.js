(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.GlobalEnglishPhone = api;
    }
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    function extractRussianPhoneDigits(value) {
        var digits = String(value || '').replace(/\D/g, '');

        if (!digits) {
            return '';
        }

        if (digits.charAt(0) === '8') {
            digits = '7' + digits.slice(1);
        } else if (digits.charAt(0) !== '7') {
            digits = '7' + digits;
        }

        return digits.slice(0, 11);
    }

    function formatRussianPhone(value) {
        var digits = extractRussianPhoneDigits(value);
        if (!digits) {
            return '';
        }

        var national = digits.slice(1);
        var formatted = '+7';

        if (national.length > 0) {
            formatted += ' (' + national.slice(0, 3);
        }
        if (national.length >= 3) {
            formatted += ')';
        }
        if (national.length > 3) {
            formatted += ' ' + national.slice(3, 6);
        }
        if (national.length > 6) {
            formatted += '-' + national.slice(6, 8);
        }
        if (national.length > 8) {
            formatted += '-' + national.slice(8, 10);
        }

        return formatted;
    }

    function isValidRussianPhone(value) {
        return extractRussianPhoneDigits(value).length === 11;
    }

    function countDigitsBefore(value, position) {
        return String(value).slice(0, Math.max(0, position)).replace(/\D/g, '').length;
    }

    function caretForDigitCount(value, digitCount) {
        if (digitCount <= 0) {
            return 0;
        }

        var seen = 0;
        for (var index = 0; index < value.length; index += 1) {
            if (/\d/.test(value.charAt(index))) {
                seen += 1;
                if (seen === digitCount) {
                    return index + 1;
                }
            }
        }
        return value.length;
    }

    function editRussianPhone(currentValue, selectionStart, selectionEnd, inputType, data) {
        var digits = extractRussianPhoneDigits(currentValue);
        var startDigit = countDigitsBefore(currentValue, selectionStart);
        var endDigit = countDigitsBefore(currentValue, selectionEnd);
        var insertion = String(data || '').replace(/\D/g, '');
        var caretDigit = startDigit;

        if (inputType === 'deleteContentBackward' && startDigit === endDigit) {
            if (startDigit > 1) {
                digits = digits.slice(0, startDigit - 1) + digits.slice(startDigit);
                caretDigit = startDigit - 1;
            }
        } else if (inputType === 'deleteContentForward' && startDigit === endDigit) {
            if (startDigit < digits.length) {
                digits = digits.slice(0, startDigit) + digits.slice(startDigit + 1);
            }
        } else {
            if (startDigit === 0) {
                startDigit = 1;
            }
            if (endDigit === 0) {
                endDigit = 1;
            }
            digits = digits.slice(0, startDigit) + insertion + digits.slice(endDigit);
            caretDigit = startDigit + insertion.length;
        }

        var value = formatRussianPhone(digits);
        return {
            value: value,
            caret: caretForDigitCount(value, Math.max(1, caretDigit)),
        };
    }

    return {
        extractRussianPhoneDigits: extractRussianPhoneDigits,
        formatRussianPhone: formatRussianPhone,
        isValidRussianPhone: isValidRussianPhone,
        editRussianPhone: editRussianPhone,
    };
}));
