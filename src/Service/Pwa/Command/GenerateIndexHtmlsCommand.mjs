import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path/posix";

/** @typedef {import("../../../../../flux-json-api/src/Adapter/Api/JsonApi.mjs").JsonApi} JsonApi */
/** @typedef {import("../../../../../flux-localization-api/src/Adapter/Api/LocalizationApi.mjs").LocalizationApi} LocalizationApi */

export class GenerateIndexHtmlsCommand {
    /**
     * @type {JsonApi}
     */
    #json_api;
    /**
     * @type {LocalizationApi}
     */
    #localization_api;

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi} localization_api
     * @returns {GenerateIndexHtmlsCommand}
     */
    static new(json_api, localization_api) {
        return new this(
            json_api,
            localization_api
        );
    }

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi} localization_api
     * @private
     */
    constructor(json_api, localization_api) {
        this.#json_api = json_api;
        this.#localization_api = localization_api;
    }

    /**
     * @param {string} manifest_json_file
     * @param {string} index_html_file
     * @param {string} web_manifest_json_file
     * @param {string} web_index_mjs_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(manifest_json_file, index_html_file, web_manifest_json_file, web_index_mjs_file, localization_folder = null) {
        if (localization_folder !== null) {
            await this.#localization_api.addModule(
                localization_folder
            );
        }

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");
        const index_html_file_dot_pos = index_html_file.lastIndexOf(".");
        const web_manifest_json_file_dot_pos = web_manifest_json_file.lastIndexOf(".");

        for (const language of [
            ...(localization_folder !== null ? Object.keys((await this.#localization_api.getLanguages()).all) : null) ?? [],
            ""
        ]) {
            const manifest = await this.#json_api.importJson(
                language !== "" ? `${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}` : manifest_json_file
            );

            await writeFile(language !== "" ? `${index_html_file.substring(0, index_html_file_dot_pos)}-${language}${index_html_file.substring(index_html_file_dot_pos)}` : index_html_file, `<!DOCTYPE html>
<html${language !== "" ? ` dir="${this.#escapeHtml(
                manifest.dir ?? null
            )}" lang="${this.#escapeHtml(
                manifest.lang ?? null
            )}"` : ""}>
    <head>
        <meta charset="UTF-8" />${language !== "" ? `
        <title>${this.#escapeHtml(
                manifest.name ?? null
            )}</title>` : ""}
        <meta content="${this.#escapeHtml(
                Object.entries({
                    "initial-scale": "1.0",
                    "maximum-scale": "1.0",
                    "minimum-scale": "1.0",
                    "user-scalable": "no"
                }).map(([
                    key,
                    value
                ]) => `${key}=${value}`).join(",")
            )}" name="viewport">
        ${(manifest.icons ?? []).map(icon => `<link href="${this.#escapeHtml(
                this.#fixUrl(
                    web_manifest_json_file,
                    icon.src ?? null
                )
            )}" rel="icon" sizes="${this.#escapeHtml(
                icon.sizes ?? null
            )}" type="${this.#escapeHtml(
                icon.type ?? null
            )}">`).join(`
        `)}${language !== "" ? `
        <meta content="${this.#escapeHtml(
                manifest.description ?? null
            )}" name="description">
        <link href="${this.#escapeHtml(
                language !== "" ? `${web_manifest_json_file.substring(0, web_manifest_json_file_dot_pos)}-${language}${web_manifest_json_file.substring(web_manifest_json_file_dot_pos)}` : web_manifest_json_file
            )}" rel="manifest">` : ""}
        <script src="${this.#escapeHtml(
                web_index_mjs_file
            )}" type="module"></script>
    </head>
    <body></body>
</html>
`);
        }
    }

    /**
     * @param {string | null} string
     * @returns {string}
     */
    #escapeHtml(string = null) {
        if (string === null || string === "") {
            return "";
        }

        return string.replaceAll("&", "&amp;").replaceAll("#", "&#35;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }

    /**
     * @param {string} web_manifest_json_file
     * @param {string | null} url
     * @returns {string}
     */
    #fixUrl(web_manifest_json_file, url = null) {
        if (url === null || url === "") {
            return "";
        }

        return join(dirname(web_manifest_json_file), url);
    }
}
