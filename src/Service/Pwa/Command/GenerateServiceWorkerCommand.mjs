import { join, relative } from "node:path";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";

export class GenerateServiceWorkerCommand {
    /**
     * @returns {GenerateServiceWorkerCommand}
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
     * @param {string} web_root
     * @param {string} application_cache_file
     * @param {string} application_cache_prefix
     * @param {string} service_worker_file
     * @returns {Promise<void>}
     */
    async generateServiceWorker(web_root, application_cache_file, application_cache_prefix, service_worker_file) {
        const application_cache_version = crypto.randomUUID();

        const application_cache_files = [
            "",
            ...await (async function scanFiles(folder) {
                const files = [];

                for (const file of await readdir(folder)) {
                    const _file = join(folder, file);

                    const _stat = await stat(_file);

                    if (_stat.isDirectory()) {
                        files.push(...await scanFiles(_file));
                    } else {
                        files.push(relative(web_root, _file));
                    }
                }

                return files;
            })(web_root)
        ];

        await writeFile(application_cache_file, (await readFile(application_cache_file, "utf8")).replaceAll("%APPLICATION-CACHE-PREFIX%", application_cache_prefix).replaceAll("%APPLICATION-CACHE-VERSION%", application_cache_version).replaceAll("[/*%APPLICATION-CACHE-FILES%*/]", JSON.stringify(application_cache_files)), "utf8");

        await writeFile(service_worker_file, (await readFile(service_worker_file, "utf8")).replaceAll("%APPLICATION-CACHE-VERSION%", application_cache_version), "utf8");
    }
}
