import { readFile } from "node:fs/promises";

/** @typedef {import("../../../flux-pwa-api/src/Pwa/Manifest.mjs").Manifest} Manifest */

export class GetManifest {
    /**
     * @returns {GetManifest}
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
     * @param {string} manifest_json_file
     * @returns {Promise<Manifest>}
     */
    async getManifest(manifest_json_file) {
        return JSON.parse(await readFile(manifest_json_file, "utf8"));
    }
}
