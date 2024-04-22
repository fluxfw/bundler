await (
    /**
     * @param {string[] | {[key: string]: string}} es_modules
     * @param {string[] | {[key: string]: string}} commonjs_modules
     * @param {string[] | {[key: string]: string}} init_loaded_modules
     * @param {number | string} root_module_id
     * @param {boolean} root_module_is_commonjs
     * @returns {Promise<{[key: string]: *}}
     */
    async (es_modules, commonjs_modules, init_loaded_modules, root_module_id, root_module_is_commonjs) => {
        const require = typeof process !== "undefined" ? (await import("node:module")).createRequire(import.meta.url) : null;

        const loaded_es_modules = structuredClone(init_loaded_modules);
        const loaded_commonjs_modules = structuredClone(init_loaded_modules);
        const loaded_commonjs_modules_for_es = structuredClone(init_loaded_modules);

        /**
         * @param {number | string} module_id
         * @returns {Promise<{[key: string]: *}>}
         */
        async function load_es_module(module_id) {
            loaded_es_modules[module_id] ??= (async () => await es_modules[module_id](
                load_es_module,
                load_commonjs_module_for_es
            ) ?? Object.freeze({}))();

            return loaded_es_modules[module_id];
        }

        /**
         * @param {number | string} module_id
         * @returns {{[key: string]: *}}
         */
        function load_commonjs_module(module_id) {
            if (!Object.hasOwn(loaded_commonjs_modules, module_id)) {
                loaded_commonjs_modules[module_id] = null;

                loaded_commonjs_modules[module_id] = (() => {
                    const module = {
                        exports: {}
                    };

                    let __filename, __dirname;
                    if (require !== null) {
                        __filename = require("node:url").fileURLToPath(import.meta.url);
                        __dirname = require("node:path").dirname(__filename);
                    } else {
                        __filename = new URL(import.meta.url).pathname;
                        __dirname = __filename.substring(0, __filename.lastIndexOf("/"));
                    }

                    commonjs_modules[module_id](
                        load_es_module,
                        load_commonjs_module,
                        module,
                        module.exports,
                        require,
                        __filename,
                        __dirname
                    );

                    return module.exports ?? Object.freeze({});
                })();
            }

            return loaded_commonjs_modules[module_id] ?? new Proxy(Object.freeze({}), {
                get: (target, key) => (loaded_commonjs_modules[module_id] ?? target)[key]
            });
        }

        /**
         * @param {number | string} module_id
         * @returns {Promise<{[key: string]: *}>}
         */
        async function load_commonjs_module_for_es(module_id) {
            loaded_commonjs_modules_for_es[module_id] ??= (async () => {
                const exports = load_commonjs_module(
                    module_id
                );

                return Object.freeze(Object.defineProperties({}, Object.fromEntries([
                    ...Object.keys(exports).filter(key => key !== "default"),
                    "default"
                ].map(key => [
                    key,
                    {
                        enumerable: true,
                        ...key === "default" ? {
                            value: exports
                        } : {
                            get: () => exports[key]
                        }
                    }
                ]))));
            })();

            return loaded_commonjs_modules_for_es[module_id];
        }

        return (root_module_is_commonjs ? load_commonjs_module_for_es : load_es_module)(
            root_module_id
        );
    })(
        "%ES_MODULES%",
        "%COMMONJS_MODULES%",
        "%INIT_LOADED_MODULES%",
        "%ROOT_MODULE_ID%",
        "%ROOT_MODULE_IS_COMMONJS%"
    );
