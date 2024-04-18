import { execFileSync } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, extname } from "node:path";

export class GenerateIcon {
    /**
     * @returns {Promise<GenerateIcon>}
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
     * @param {string} input_file
     * @param {string} output_file
     * @param {string} sizes
     * @param {string} type
     * @returns {Promise<void>}
     */
    async generateIcon(input_file, output_file, sizes, type) {
        console.log(`Generate ${output_file}`);

        if (sizes !== "any" && !/^\d+x\d+$/.test(sizes)) {
            throw new Error(`Invalid sizes ${sizes}!`);
        }

        await mkdir(dirname(output_file), {
            recursive: true
        });

        if (sizes === "any" && type === "image/svg+xml" && extname(input_file).substring(1).toLowerCase() === "svg") {
            await copyFile(input_file, output_file);
            return;
        }

        execFileSync("magick", [
            "-background",
            "none",
            input_file,
            ...sizes !== "any" ? [
                "-filter",
                "point",
                "-resize",
                sizes
            ] : [],
            output_file
        ]);
    }
}
