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
