import { dirname, join } from "node:path/posix";
import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("../../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */

export class GenerateIndexHtmls {
    /**
     * @type {FluxLocalizationApi | null}
     */
    #flux_localization_api;

    /**
     * @param {FluxLocalizationApi | null} flux_localization_api
     * @returns {GenerateIndexHtmls}
     */
    static new(flux_localization_api = null) {
        return new this(
            flux_localization_api
        );
    }

    /**
     * @param {FluxLocalizationApi | null} flux_localization_api
     * @private
     */
    constructor(flux_localization_api) {
        this.#flux_localization_api = flux_localization_api;
    }

    /**
     * @param {string} index_template_html_file
     * @param {string} index_html_file
     * @param {string} manifest_json_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(index_template_html_file, index_html_file, manifest_json_file, localization_folder = null) {
        if (localization_folder !== null) {
            if (this.#flux_localization_api === null) {
                throw new Error("Missing FluxLocalizationApi");
            }

            this.#flux_localization_api.addModule(
                localization_folder
            );
        }

        let index_html = await readFile(index_template_html_file, "utf8");

        const manifest_placeholder = "%MANIFEST%";
        const manifest_href_placeholder = " href=\"";
        const manifest_placeholder_pos = index_html.indexOf(manifest_placeholder);
        if (manifest_placeholder_pos === -1) {
            throw new Error("Missing manifest");
        }
        const manifest_href_pos = index_html.substring(manifest_placeholder_pos).indexOf(" href=\"");
        if (manifest_href_pos === -1) {
            throw new Error("Missing manifest");
        }
        const manifest_href_end_pos = index_html.substring(manifest_placeholder_pos + manifest_href_pos + manifest_href_placeholder.length).indexOf("\"");
        if (manifest_href_end_pos === -1) {
            throw new Error("Missing manifest");
        }
        const web_manifest_json_file = index_html.substring(manifest_placeholder_pos + manifest_href_pos + manifest_href_placeholder.length, manifest_placeholder_pos + manifest_href_pos + manifest_href_placeholder.length + manifest_href_end_pos);
        if (web_manifest_json_file === "") {
            throw new Error("Missing manifest");
        }
        index_html = `${index_html.substring(0, manifest_placeholder_pos)}${index_html.substring(manifest_placeholder_pos + manifest_placeholder.length, manifest_placeholder_pos + manifest_href_pos + manifest_href_placeholder.length)}${manifest_placeholder}${index_html.substring(manifest_placeholder_pos + manifest_href_pos + manifest_href_placeholder.length + manifest_href_end_pos)}`;

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");
        const index_html_file_dot_pos = index_html_file.lastIndexOf(".");
        const web_manifest_json_file_dot_pos = web_manifest_json_file.lastIndexOf(".");

        for (const language of [
            ...(localization_folder !== null ? Object.keys((await this.#flux_localization_api.getLanguages()).all) : null) ?? [],
            ""
        ]) {
            const localized_index_html_file = language !== "" ? `${index_html_file.substring(0, index_html_file_dot_pos)}-${language}${index_html_file.substring(index_html_file_dot_pos)}` : index_html_file;

            console.log(`Generate ${localized_index_html_file}`);

            const manifest = JSON.parse(await readFile(language !== "" ? `${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}` : manifest_json_file, "utf8"));

            let localized_index_html = index_html;

            for (const key of [
                "description",
                "dir",
                "icons",
                "lang",
                "manifest",
                "name",
                "short_name"
            ]) {
                const placeholder_key = `%${key.toUpperCase()}%`;

                if (key === "icons" ? (manifest.icons ?? []).length > 0 : language !== "" && (key === "manifest" ? true : (manifest[key] ?? "") !== "")) {
                    switch (key) {
                        case "icons":
                            localized_index_html = localized_index_html.split("\n").map(line => {
                                if (!line.includes(placeholder_key)) {
                                    return line;
                                }

                                const icons_line = line.replace(placeholder_key, "");

                                return manifest.icons.map(icon => {
                                    let icon_line = icons_line;

                                    for (const icon_key of [
                                        "sizes",
                                        "src",
                                        "type"
                                    ]) {
                                        icon_line = icon_line.replaceAll(`%ICON_${icon_key.toUpperCase()}%`, this.#escapeHtml(
                                            icon_key === "src" ? this.#fixUrl(
                                                web_manifest_json_file,
                                                icon.src ?? null
                                            ) : icon[icon_key] ?? null
                                        ));
                                    }

                                    return icon_line;
                                }).join("\n");
                            }).join("\n");
                            break;

                        case "manifest":
                            localized_index_html = localized_index_html.replaceAll(placeholder_key, this.#escapeHtml(
                                language !== "" ? `${web_manifest_json_file.substring(0, web_manifest_json_file_dot_pos)}-${language}${web_manifest_json_file.substring(web_manifest_json_file_dot_pos)}` : web_manifest_json_file
                            ));
                            break;

                        default:
                            localized_index_html = localized_index_html.replaceAll(placeholder_key, this.#escapeHtml(
                                manifest[key]
                            ));
                            break;
                    }
                } else {
                    localized_index_html = localized_index_html.replaceAll(` ${key}="${placeholder_key}"`, "").split("\n").filter(line => !line.includes(placeholder_key)).join("\n");
                }
            }

            await writeFile(localized_index_html_file, localized_index_html);
        }
    }

    /**
     * @param {string | null} string
     * @returns {string}
     */
    #escapeHtml(string = null) {
        if ((string ?? "") === "") {
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
        if ((url ?? "") === "") {
            return "";
        }

        return join(dirname(web_manifest_json_file), url);
    }
}
