// Locale-independent utilities for text direction and logical placement.
const RTL = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb']);
export function direction(locale) {
    if (typeof locale !== 'string' || !locale.trim()) return 'ltr';
    try {
        const tag = new Intl.Locale(locale.replaceAll('_', '-'));
        const script = tag.script;
        if (script) return ['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Adlm', 'Syrc', 'Rohg'].includes(script) ? 'rtl' : 'ltr';
        return RTL.has(tag.language) ? 'rtl' : 'ltr';
    } catch {
        return 'ltr';
    }
}
export function logicalSide(side, dir) {
    if (!['start', 'end'].includes(side) || !['ltr', 'rtl'].includes(dir)) {
        throw new TypeError('Invalid logical side or direction');
    }
    return (side === 'start') === (dir === 'ltr') ? 'left' : 'right';
}

const LOGICAL_SIDES = new Set(['block-start', 'block-end', 'inline-start', 'inline-end']);
const WRITING_MODES = new Set(['horizontal-tb', 'vertical-rl', 'vertical-lr']);

/**
 * Resolve a CSS logical edge to its physical side.
 *
 * Supports horizontal-tb, vertical-rl and vertical-lr. This is a pure
 * mapping utility; it does not inspect or mutate DOM styles. Sideways
 * writing modes and CSS direction:auto resolution are intentionally outside
 * this API.
 */
export function physicalSide(side, dir, writingMode = 'horizontal-tb') {
    if (!LOGICAL_SIDES.has(side) || !['ltr', 'rtl'].includes(dir)
        || !WRITING_MODES.has(writingMode)) {
        throw new TypeError('Invalid logical side, direction or writing mode');
    }
    if (writingMode === 'horizontal-tb') {
        if (side === 'block-start') return 'top';
        if (side === 'block-end') return 'bottom';
        return logicalSide(side.slice('inline-'.length), dir);
    }
    if (side === 'block-start') return writingMode === 'vertical-rl' ? 'right' : 'left';
    if (side === 'block-end') return writingMode === 'vertical-rl' ? 'left' : 'right';
    if (side === 'inline-start') return dir === 'ltr' ? 'top' : 'bottom';
    return dir === 'ltr' ? 'bottom' : 'top';
}
