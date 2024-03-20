import { execFileSync } from "node:child_process";
import { copyFile, readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

export class GenerateIcons {
    /**
     * @returns {Promise<GenerateIcons>}
     */
    static async new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {((icon_file: string) => string) | string} get_icon_template_file
     * @param {string} manifest_json_file
     * @returns {Promise<void>}
     */
    async generateIcons(get_icon_template_file, manifest_json_file) {
        const manifest = JSON.parse(await readFile(manifest_json_file, "utf8"));

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

            execFileSync("magick", [
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
