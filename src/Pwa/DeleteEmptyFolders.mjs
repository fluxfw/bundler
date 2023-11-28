import { join } from "node:path/posix";
import { lstat, readdir, rmdir, stat, unlink } from "node:fs/promises";

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
            let _stat;
            try {
                _stat = await lstat(folder);
            } catch (error) {
                if ((error?.code ?? null) === "ENOENT") {
                    continue;
                }

                throw error;
            }

            if (!this.#output_header) {
                this.#output_header = true;
                console.log("Delete empty folders:");
            }

            console.log(`- ${folder}`);

            if (_stat.isDirectory()) {
                await rmdir(folder);
            } else {
                await unlink(folder);
            }
        }

        await this.deleteEmptyFolders(
            root
        );
    }
}
