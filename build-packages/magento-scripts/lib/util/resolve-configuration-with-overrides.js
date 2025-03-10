const path = require('path');
const { configFileSchema } = require('./config-file-validator');
const { deepmerge } = require('./deepmerge');
const pathExists = require('./path-exists');

const resolveConfigurationWithOverrides = async (configuration, baseConfig, projectPath = process.cwd()) => {
    const configJSFilePath = path.join(projectPath, 'cma.js');
    if (await pathExists(configJSFilePath)) {
        const userConfiguration = require(configJSFilePath);

        try {
            await configFileSchema.validateAsync(userConfiguration);
        } catch (e) {
            throw new Error(`Configuration file validation error!\n\n${e.message}`);
        }

        const overridenConfiguration = deepmerge(configuration, userConfiguration);

        return {
            userConfiguration,
            overridenConfiguration
        };
    }

    return {
        userConfiguration: configuration,
        overridenConfiguration: configuration
    };
};

module.exports = resolveConfigurationWithOverrides;
