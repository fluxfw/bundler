import { existsSync } from "node:fs";
import { FileFilter } from "./FileFilter.mjs";
import { join } from "node:path/posix";
import { readFile, writeFile } from "node:fs/promises";

export class GenerateServiceWorker {
    /**
     * @type {FileFilter}
     */
    #file_filter;

    /**
     * @returns {GenerateServiceWorker}
     */
    static new() {
        return new this(
            FileFilter.new()
        );
    }

    /**
     * @param {FileFilter} file_filter
     * @private
     */
    constructor(file_filter) {
        this.#file_filter = file_filter;
    }

    /**
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {string} root
     * @param {string | null} application_cache_prefix
     * @param {{[key: string]: *} | null} data
     * @param {((root_file: string) => boolean) | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, root, application_cache_prefix = null, data = null, file_filter = null, exclude_jsdoc_files = null) {
        console.log(`Generate ${service_worker_mjs_file}`);

        if (!existsSync(service_worker_mjs_file)) {
            await writeFile(service_worker_mjs_file, Buffer.alloc(0));
        }

        const [
            files,
            excluded_file_filter_files,
            excluded_jsdoc_files
        ] = await this.#file_filter.fileFilter(
            root,
            file_filter,
            exclude_jsdoc_files
        );

        if (excluded_file_filter_files.length > 0) {
            for (const root_file of excluded_file_filter_files) {
                const file = join(root, root_file);

                console.log(`Exclude ${file} from application cache files (File filter)`);
            }
        }

        if (excluded_jsdoc_files.length > 0) {
            for (const root_file of excluded_jsdoc_files) {
                const file = join(root, root_file);

                console.log(`Exclude ${file} from application cache files (JSDoc file)`);
            }
        }

        await writeFile(service_worker_mjs_file, (await readFile(service_worker_template_mjs_file, "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data,
            APPLICATION_CACHE_FILES: files,
            ...application_cache_prefix !== null ? {
                APPLICATION_CACHE_PREFIX: application_cache_prefix
            } : null,
            APPLICATION_CACHE_VERSION: crypto.randomUUID(),
            ...application_cache_prefix !== null ? {
                SKIP_WAITING: (await import("../../flux-pwa/src/Pwa/SKIP_WAITING.mjs")).SKIP_WAITING
            } : null
        })));
    }
}
