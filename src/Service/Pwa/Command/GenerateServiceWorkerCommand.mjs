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
     * @param {string} service_worker_file
     * @param {{[key: string]: *}} data
     * @returns {Promise<void>}
     */
    async generateServiceWorker(web_root, service_worker_file, data) {
        await writeFile(service_worker_file, (await readFile(service_worker_file, "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data,
            APPLICATION_CACHE_VERSION: crypto.randomUUID(),
            APPLICATION_CACHE_FILES: [
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
            ]
        })), "utf8");
    }
}
