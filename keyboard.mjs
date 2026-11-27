/**
 * Pure keyboard navigation for a one-dimensional composite widget.
 * The caller owns DOM focus, ARIA roles, event.preventDefault, and selection.
 * Disabled items are skipped by this policy; widgets that intentionally allow
 * disabled items to receive focus must use a different policy.
 */
export function nextFocus(items, current, key, options = {}) {
    const { orientation = 'horizontal', direction = 'ltr', wrap = false } = options;
    if (!Array.isArray(items) || !['horizontal', 'vertical'].includes(orientation)
        || !['ltr', 'rtl'].includes(direction) || typeof wrap !== 'boolean') {
        throw new TypeError('Invalid navigation configuration');
    }
    const seen = new Set();
    for (const item of items) {
        if (!item || typeof item.id !== 'string' || !item.id.trim()
            || seen.has(item.id) || (item.disabled !== undefined && typeof item.disabled !== 'boolean')) {
            throw new TypeError('Items must have unique nonempty IDs and optional boolean disabled flags');
        }
        seen.add(item.id);
    }
    if (current !== null && !seen.has(current)) {
        throw new TypeError('Current ID must be null or present in items');
    }
    const forward = orientation === 'vertical' ? 'ArrowDown'
        : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = orientation === 'vertical' ? 'ArrowUp'
        : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (![forward, backward, 'Home', 'End'].includes(key)) {
        return { handled: false, id: current };
    }
    const enabled = items.filter(item => !item.disabled);
    if (enabled.length === 0) return { handled: false, id: current };
    if (key === 'Home') return { handled: true, id: enabled[0].id };
    if (key === 'End') return { handled: true, id: enabled.at(-1).id };
    const step = key === forward ? 1 : -1;
    const origin = current === null
        ? (step === 1 ? -1 : items.length)
        : items.findIndex(item => item.id === current);
    for (let distance = 1; distance <= items.length; distance++) {
        let index = origin + step * distance;
        if (wrap) index = (index + items.length) % items.length;
        else if (index < 0 || index >= items.length) break;
        if (!items[index].disabled) return { handled: true, id: items[index].id };
    }
    return { handled: true, id: current };
}
