/**
 * Plan a top/bottom popover in a single coordinate space (CSS pixels).
 * Pure geometry: the caller owns measuring, scrolling, clipping ancestors,
 * focus, CSS application and remeasurement after content/layout changes.
 */
const LIMIT = 1e9;
function number(value, label, min = -LIMIT) {
    if (!Number.isFinite(value) || value < min || value > LIMIT) {
        throw new TypeError('Invalid ' + label);
    }
    return value;
}
function rect(value, label) {
    if (!value || typeof value !== 'object') throw new TypeError('Invalid ' + label);
    return {
        x: number(value.x, label + '.x'),
        y: number(value.y, label + '.y'),
        width: number(value.width, label + '.width', 0),
        height: number(value.height, label + '.height', 0),
    };
}
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function placePopover(anchor, popup, viewport, options = {}) {
    const a = rect(anchor, 'anchor');
    const v = rect(viewport, 'viewport');
    if (!popup || typeof popup !== 'object') throw new TypeError('Invalid popup');
    const width = number(popup.width, 'popup.width', 0);
    const height = number(popup.height, 'popup.height', 0);
    const { side = 'bottom', align = 'start', direction = 'ltr', gap = 8, padding = 8 } = options;
    if (!['top', 'bottom'].includes(side) || !['start', 'center', 'end'].includes(align)
        || !['ltr', 'rtl'].includes(direction)) throw new TypeError('Invalid placement options');
    number(gap, 'gap', 0);
    number(padding, 'padding', 0);
    if (width === 0 || height === 0 || v.width <= 2 * padding || v.height <= 2 * padding) return null;
    // An offscreen anchor is not a reason to pin an unrelated popup to an edge.
    if (a.x + a.width < v.x || a.x > v.x + v.width
        || a.y + a.height < v.y || a.y > v.y + v.height) return null;

    const left = v.x + padding;
    const right = v.x + v.width - padding;
    const top = v.y + padding;
    const bottom = v.y + v.height - padding;
    const above = clamp(a.y - gap, top, bottom);
    const below = clamp(a.y + a.height + gap, top, bottom);
    const spaces = { top: above - top, bottom: bottom - below };
    const opposite = side === 'top' ? 'bottom' : 'top';
    // Prefer the requested side when it fits. Otherwise flip only if the
    // opposite offers strictly more room; ties preserve the requested side.
    const placement = spaces[side] < height && spaces[opposite] > spaces[side] ? opposite : side;
    const actualHeight = Math.min(height, spaces[placement]);
    const actualWidth = Math.min(width, right - left);
    if (actualHeight <= 0 || actualWidth <= 0) return null;
    let desiredX = a.x + (a.width - actualWidth) / 2;
    if (align !== 'center') {
        const leftAligned = (align === 'start') === (direction === 'ltr');
        desiredX = leftAligned ? a.x : a.x + a.width - actualWidth;
    }
    const x = clamp(desiredX, left, right - actualWidth);
    const y = placement === 'top' ? above - actualHeight : below;
    return {
        x, y, width: actualWidth, height: actualHeight, side: placement,
        flipped: placement !== side,
        resized: actualWidth < width || actualHeight < height,
        shifted: x !== desiredX,
    };
}
