import { existsSync } from "node:fs";
import { join } from "node:path/posix";
import { unlink } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */

export class DeleteIgnoresFiles {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @returns {DeleteIgnoresFiles}
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
     * @param {string} web_root
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} ignore_jsdoc_files
     * @returns {Promise<void>}
     */
    async deleteIgnoresFiles(web_root, file_filter = null, ignore_jsdoc_files = null) {
        const [
            ,
            ignored_file_filter_files,
            ignored_jsdoc_files
        ] = await this.#flux_pwa_generator.scanFiles(
            web_root,
            file_filter,
            ignore_jsdoc_files
        );

        for (const web_root_file of ignored_file_filter_files) {
            const file = join(web_root, web_root_file);
            if (!existsSync(file)) {
                continue;
            }
            console.log(`- Delete ignored ${file} (File filter)`);
            await unlink(file);
        }

        for (const web_root_file of ignored_jsdoc_files) {
            const file = join(web_root, web_root_file);
            if (!existsSync(file)) {
                continue;
            }
            console.log(`- Delete ignored ${file} (JSDoc file)`);
            await unlink(file);
        }
    }
}
