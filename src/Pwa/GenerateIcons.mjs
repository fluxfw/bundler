import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path/posix";

export class GenerateIcons {
    /**
     * @returns {GenerateIcons}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {string} fallback_icon_template_svg_file
     * @param {string} manifest_json_file
     * @returns {Promise<void>}
     */
    async generateIcons(fallback_icon_template_svg_file, manifest_json_file) {
        const manifest = JSON.parse(await readFile(manifest_json_file, "utf8"));

        for (const icon of manifest.icons ?? []) {
            if ((icon.src ?? "") === "") {
                throw new Error("Invalid icon");
            }

            let icon_template_svg_file = join(dirname(manifest_json_file), `${icon.src.substring(0, icon.src.lastIndexOf("."))}-template.svg`);
            if (!existsSync(icon_template_svg_file)) {
                icon_template_svg_file = fallback_icon_template_svg_file;
            }

            const icon_file = join(dirname(icon_template_svg_file), icon.src);

            console.log(`Generate ${icon_file}`);

            if ((icon.sizes ?? "") === "" || (icon.sizes !== "any" && !/^\d+x\d+$/.test(icon.sizes)) || (icon.type ?? "") === "") {
                throw new Error("Invalid icon");
            }

            if (icon.type === "image/svg+xml" && icon.sizes === "any") {
                await copyFile(icon_template_svg_file, icon_file);
                continue;
            }

            execFileSync("magick", [
                icon_template_svg_file,
                "-background",
                "none",
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
