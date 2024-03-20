import { existsSync } from "node:fs";
import { join } from "node:path";
import { lstat, readdir, rmdir, unlink } from "node:fs/promises";

export class DeleteEmptyFoldersOrInvalidSymlinks {
    /**
     * @returns {Promise<DeleteEmptyFoldersOrInvalidSymlinks>}
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
     * @param {string} root
     * @returns {Promise<void>}
     */
    async deleteEmptyFoldersOrInvalidSymlinks(root) {
        const files = await (async function scanFiles(folder) {
            const _files = [];

            const names = await readdir(folder);

            if (names.length === 0) {
                _files.push(folder);
            }

            for (const name of names) {
                const file = join(folder, name);

                const stat = await lstat(file);

                if (stat.isDirectory()) {
                    _files.push(...await scanFiles(
                        file
                    ));
                } else {
                    if (stat.isSymbolicLink() && !existsSync(file)) {
                        _files.push(file);
                    }
                }
            }

            return _files;
        })(
            root
        );

        if (files.length === 0) {
            return;
        }

        for (const file of files) {
            let stat;
            try {
                stat = await lstat(file);
            } catch (error) {
                if ((error?.code ?? null) === "ENOENT") {
                    continue;
                }

                throw error;
            }

            if (stat.isDirectory()) {
                console.log(`Delete ${file} (Empty folder)`);
                await rmdir(file);
            } else {
                console.log(`Delete ${file} (Invalid symlink)`);
                await unlink(file);
            }
        }

        await this.deleteEmptyFoldersOrInvalidSymlinks(
            root
        );
    }
}
