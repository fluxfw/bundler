await (async modules => {
    const loaded_modules = { /*%INIT_LOADED_MODULES%*/ };

    /**
     * @param {number | string} id
     * @returns {Promise<{[key: string]: *}>}
     */
    const load_module = async id => {
        loaded_modules[id] ??= (async () => await modules[id](
            load_module
        ) ?? Object.freeze({}))();

        return loaded_modules[id];
    };

    return load_module(
        /*%ROOT_MODULE_ID%*/
    );
})(
    { /*%MODULES%*/ }
);
