/**
 * @param {(module_id: number | string) => Promise<*>} load_es_module
 * @param {(module_id: number | string) => Promise<*>} load_commonjs_module_for_es
 * @param {(module_id: number | string) => *} load_commonjs_module
 * @param {{exports: {[key: string]: *}}} module
 * @param {{[key: string]: *}} exports
 * @param {(id: string) => *} require
 * @param {string} __filename
 * @param {string} __dirname
 * @returns {void}
 */
(load_es_module, load_commonjs_module_for_es, load_commonjs_module, module, exports, require, __filename, __dirname) => {
    "%CODE%"
}
