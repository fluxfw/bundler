/**
 * @param {string} css
 * @returns {Promise<CSSStyleSheet>}
 */
export async function cssToStyleSheet(css) {
    const style_sheet = new CSSStyleSheet();
    style_sheet.replaceSync(css);
    return style_sheet;
}
