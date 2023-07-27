export const MANIFEST_TEMPLATE = Object.freeze({
    background_color: "#ffffff",
    categories: Object.freeze([]),
    description: "",
    dir: "ltr",
    display: "browser",
    icons: Object.freeze([
        {
            purpose: "any",
            sizes: "any",
            src: "../Icon/icon.svg",
            type: "image/svg+xml"
        },
        {
            purpose: "any",
            sizes: "1024x1024",
            src: "../Icon/icon.webp",
            type: "image/webp"
        },
        {
            purpose: "any",
            sizes: "32x32",
            src: "../favicon.ico",
            type: "image/x-icon"
        }
    ].map(icon => Object.freeze(icon))),
    id: "",
    lang: "en",
    name: "",
    scope: "..",
    short_name: "",
    start_url: "..",
    theme_color: "#000000"
});
