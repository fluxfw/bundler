import { existsSync } from "node:fs";
import { join } from "node:path/posix";
import { unlink } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */

export class DeleteExcludedFiles {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @returns {DeleteExcludedFiles}
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
     * @param {string} root
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async deleteExcludedFiles(root, file_filter = null, exclude_jsdoc_files = null) {
        const [
            ,
            excluded_file_filter_files,
            excluded_jsdoc_files
        ] = await this.#flux_pwa_generator.scanFiles(
            root,
            file_filter,
            exclude_jsdoc_files
        );

        if (excluded_file_filter_files.length > 0) {
            let output_header = false;

            for (const root_file of excluded_file_filter_files) {
                const file = join(root, root_file);

                if (!existsSync(file)) {
                    continue;
                }

                if (!output_header) {
                    output_header = true;
                    console.log("Delete excluded files (File filter):");
                }

                console.log(`- ${file}`);

                await unlink(file);
            }
        }

        if (excluded_jsdoc_files.length > 0) {
            let output_header = false;

            for (const root_file of excluded_jsdoc_files) {
                const file = join(root, root_file);

                if (!existsSync(file)) {
                    continue;
                }

                if (!output_header) {
                    output_header = true;
                    console.log("Delete excluded files (JSDoc file):");
                }

                console.log(`- ${file}`);

                await unlink(file);
            }
        }
    }
}
