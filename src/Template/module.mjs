/**
 * @param {(module_id: number | string) => Promise<*>} load_es_module
 * @param {(module_id: number | string) => Promise<*>} load_commonjs_module_for_es
 * @param {(object: {[key: string]: *}) => void} export_es_object
 * @param {(key: string, get_value: () => *) => void} export_es_key
 * @param {{dirname?: string, filename?: string, resolve: (specifier: string) => string, url: string}} import_meta
 * @returns {Promise<void>}
 */
async (load_es_module, load_commonjs_module_for_es, export_es_object, export_es_key, import_meta) => {
    "%CODE%"
}
