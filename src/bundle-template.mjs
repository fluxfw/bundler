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
        const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
        const __dirname = (await import("node:path")).dirname(__filename);
        const require = (await import("node:module")).createRequire(__filename);

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
         * @returns {{[key: string]: *}}
         */
        function load_commonjs_module_for_es(module_id) {
            loaded_commonjs_modules_for_es[module_id] ??= Object.freeze({
                default: load_commonjs_module(
                    module_id
                )
            });

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
