import { copyFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, extname, join } from "node:path/posix";

/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */
/** @typedef {import("./getIconTemplateFile.mjs").getIconTemplateFile} getIconTemplateFile */

const execFilePromise = promisify(execFile);

export class GenerateIcons {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @returns {GenerateIcons}
     */
    static new(flux_pwa_generator) {
        return new this(
            flux_pwa_generator
        );
    }

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @private
     */
    constructor(flux_pwa_generator) {
        this.#flux_pwa_generator = flux_pwa_generator;
    }

    /**
     * @param {getIconTemplateFile | string} get_icon_template_file
     * @param {string} manifest_json_file
     * @returns {Promise<void>}
     */
    async generateIcons(get_icon_template_file, manifest_json_file) {
        const manifest = await this.#flux_pwa_generator.getManifest(
            manifest_json_file
        );

        for (const icon of manifest.icons ?? []) {
            if ((icon.src ?? "") === "") {
                throw new Error("Invalid icon");
            }

            const icon_file = join(dirname(manifest_json_file), icon.src);

            console.log(`Generate ${icon_file}`);

            const icon_template_file = typeof get_icon_template_file === "function" ? get_icon_template_file(
                icon_file
            ) : get_icon_template_file;

            if ((icon.sizes ?? "") === "" || (icon.sizes !== "any" && !/^\d+x\d+$/.test(icon.sizes)) || (icon.type ?? "") === "") {
                throw new Error("Invalid icon");
            }

            if (icon.sizes === "any" && icon.type === "image/svg+xml" && extname(icon_template_file).substring(1).toLowerCase() === "svg") {
                await copyFile(icon_template_file, icon_file);
                continue;
            }

            await execFilePromise("magick", [
                "-background",
                "none",
                icon_template_file,
                ...icon.sizes !== "any" ? [
                    "-filter",
                    "point",
                    "-resize",
                    icon.sizes
                ] : [],
                icon_file
            ]);
        }
    }
}
