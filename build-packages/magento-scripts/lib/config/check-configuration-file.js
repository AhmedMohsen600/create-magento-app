const path = require('path');
const fs = require('fs');
const { getBaseConfig } = require('./index');
const pathExists = require('../util/path-exists');
const { deepmerge } = require('../util/deepmerge');
const { defaultMagentoConfig } = require('./magento-config');
const setConfigFile = require('../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const checkConfigurationFile = () => ({
    title: 'Checking configuration file',
    task: async (ctx, task) => {
        const { projectPath = process.cwd() } = ctx;
        const { cacheDir, templateDir } = getBaseConfig(projectPath);
        const configJSFilePath = path.join(projectPath, 'cma.js');
        const magentoConfigFilePath = path.join(cacheDir, 'app-config.json');

        if (!await pathExists(configJSFilePath)) {
            const legacyMagentoConfigExists = await pathExists(magentoConfigFilePath);

            let magentoConfiguration;

            if (legacyMagentoConfigExists) {
                const legacyMagentoConfig = JSON.parse(
                    await fs.promises.readFile(magentoConfigFilePath, 'utf-8')
                );

                magentoConfiguration = legacyMagentoConfig.magento || legacyMagentoConfig;
            } else {
                const magentoEdition = await task.prompt({
                    type: 'Select',
                    message: `Please select Magento edition you want to install.

Note that Enterprise edition requires Magento Enterprise License keys.`,
                    choices: ['Community', 'Enterprise']
                });

                magentoConfiguration = deepmerge(defaultMagentoConfig, {
                    edition: magentoEdition.toLowerCase()
                });
            }

            await setConfigFile({
                configPathname: configJSFilePath,
                template: path.join(templateDir, 'cma-config.template.js'),
                overwrite: false,
                templateArgs: {
                    magentoConfiguration
                }
            });
        }
    }
});

module.exports = checkConfigurationFile;
