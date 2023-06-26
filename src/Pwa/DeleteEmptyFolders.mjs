import { existsSync } from "node:fs";
import { join } from "node:path/posix";
import { readdir, rmdir, stat } from "node:fs/promises";

export class DeleteEmptyFolders {
    /**
     * @type {boolean}
     */
    #output_header;

    /**
     * @returns {DeleteEmptyFolders}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {
        this.#output_header = false;
    }

    /**
     * @param {string} root
     * @returns {Promise<void>}
     */
    async deleteEmptyFolders(root) {
        const folders = await (async function scanFiles(folder) {
            const files = [];

            const names = await readdir(folder);

            if (names.length === 0) {
                files.push(folder);
            }

            for (const name of names) {
                const file = join(folder, name);

                if (!(await stat(file)).isDirectory()) {
                    continue;
                }

                files.push(...await scanFiles(
                    file
                ));
            }

            return files;
        })(
            root
        );

        if (folders.length === 0) {
            return;
        }

        for (const folder of folders) {
            if (!existsSync(folder)) {
                continue;
            }

            if (!this.#output_header) {
                this.#output_header = true;
                console.log("Delete empty folders:");
            }

            console.log(`- ${folder}`);

            await rmdir(folder);
        }

        await this.deleteEmptyFolders(
            root
        );
    }
}
