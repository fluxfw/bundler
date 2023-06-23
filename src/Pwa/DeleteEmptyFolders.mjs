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
        const empty_folders = (await (async function scanFolders(folder) {
            const files = await readdir(folder);

            const folders = [
                [
                    folder,
                    files.length
                ]
            ];

            for (const file of files) {
                const _file = join(folder, file);

                if (!(await stat(_file)).isDirectory()) {
                    continue;
                }

                folders.push(await scanFolders(
                    _file
                ));
            }

            return folders;
        })(
            root
        )).filter(([
            ,
            count
        ]) => count === 0);

        if (empty_folders.length === 0) {
            return;
        }

        if (!this.#output_header) {
            this.#output_header = true;
            console.log("Delete empty folders:");
        }

        for (const root_folder of empty_folders) {
            const folder = join(root, root_folder);

            if (!existsSync(folder)) {
                continue;
            }

            console.log(`- ${folder}`);

            await rmdir(folder);
        }

        await this.deleteEmptyFolders(
            root
        );
    }
}
