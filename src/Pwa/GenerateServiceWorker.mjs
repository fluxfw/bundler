import { join } from "node:path/posix";
import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */

export class GenerateServiceWorker {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @returns {GenerateServiceWorker}
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
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {string} root
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, root, data = null, file_filter = null, exclude_jsdoc_files = null) {
        console.log(`Generate ${service_worker_mjs_file}`);

        await writeFile(service_worker_mjs_file, "");

        const [
            files,
            excluded_file_filter_files,
            excluded_jsdoc_files
        ] = await this.#flux_pwa_generator.scanFiles(
            root,
            file_filter,
            exclude_jsdoc_files
        );

        if (excluded_file_filter_files.length > 0) {
            console.log("- Excluded files from application cache files (File filter):");

            for (const root_file of excluded_file_filter_files) {
                const file = join(root, root_file);

                console.log(`  - ${file}`);
            }
        }

        if (excluded_jsdoc_files.length > 0) {
            console.log("- Excluded files from application cache files (JSDoc file):");

            for (const root_file of excluded_jsdoc_files) {
                const file = join(root, root_file);

                console.log(`  - ${file}`);
            }
        }

        await writeFile(service_worker_mjs_file, (await readFile(service_worker_template_mjs_file, "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data,
            APPLICATION_CACHE_FILES: [
                ...file_filter !== null && !file_filter(
                    ""
                ) ? [] : [
                    ""
                ],
                ...files
            ],
            APPLICATION_CACHE_VERSION: crypto.randomUUID()
        })));
    }
}
