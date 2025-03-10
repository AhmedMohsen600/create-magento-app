const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const phpbrewConfig = require('../../config/phpbrew');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const compileOptions = require('../php/compile-options');

const latestStablePHP74 = '7.4.27';
const phpbrewPHPName = `php-${latestStablePHP74}-phpbrew`;

const compileOptionsForPhp = {
    linux: {
        ...compileOptions.linux,
        variants: [
            '+default'
        ],
        extraOptions: []
    },
    darwin: {
        ...compileOptions.darwin,
        variants: [
            '+default',
            '+openssl=$(brew --prefix openssl@1.1)'
        ],
        extraOptions: []
    }
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installPHPForPHPBrew = () => ({
    title: `Installing PHP ${latestStablePHP74} for PHPBrew...`,
    task: async (ctx, task) => {
        const platformCompileOptions = compileOptionsForPhp[process.platform];

        if (!await pathExists(path.join(phpbrewConfig.phpPath, `${phpbrewPHPName}`, 'bin'))) {
            const commandEnv = Object.entries(platformCompileOptions.env || {}).map(([key, value]) => `${key}="${value}"`).join(' ');

            // eslint-disable-next-line max-len
            const compileCommand = `${commandEnv ? `${commandEnv} && ` : ''}phpbrew install -j ${platformCompileOptions.cpuCount} ${latestStablePHP74} as ${phpbrewPHPName} ${platformCompileOptions.variants.join(' ')}`;

            try {
                await execAsyncSpawn(
                    compileCommand,
                    {
                        callback: (t) => {
                            task.output = t;
                        }
                    }
                );
            } catch (e) {
                throw new Error(
                    `Failed to compile the required by PHPBrew PHP version.
Tried compiling the PHP version ${ latestStablePHP74 }.
Use your favorite search engine to resolve the issue.
See error details in the output below.\n\n${e}`
                );
            }
        }

        try {
            const phpbrewInitFileContent = `# DO NOT EDIT THIS FILE

export PHPBREW_ROOT=${phpbrewConfig.homePath}
export PHPBREW_HOME=${phpbrewConfig.homePath}
export PHPBREW_PHP=${phpbrewPHPName}
export PHPBREW_PATH=${phpbrewConfig.homePath}/php/${phpbrewPHPName}/bin
# Run this command to configure your shell:
# eval "$(phpbrew env)"\n`;

            await fs.promises.writeFile(
                path.join(phpbrewConfig.homePath, 'init'),
                phpbrewInitFileContent,
                {
                    encoding: 'utf-8'
                }
            );
        } catch (e) {
            throw new Error(`Something went wrong when trying to switch PHP to ${phpbrewPHPName}!\n\n${e}`);
        }

        throw new Error(`You will need to restart your terminal and run ${logger.style.command('start')} again.

You can use keyboard shortcut ${logger.style.command('CTRL+D')} to close terminal.`);
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPHPVersion = () => ({
    title: 'Checking system PHP version',
    task: async (ctx, task) => {
        const phpVersionResponse = await execAsyncSpawn('php --version');

        const phpVersionResponseResult = phpVersionResponse.match(/PHP\s(\d\.\d\.\d)/i);

        if (phpVersionResponseResult && phpVersionResponseResult.length > 0) {
            const phpVersion = phpVersionResponseResult[1];

            if (semver.satisfies(phpVersion, '>=8.1.x')) {
                const userConfirmation = await task.prompt({
                    type: 'Confirm',
                    message: `You have PHP ${phpVersion} installed in the system.
PHPBrew can work with this version but it will have a lot of warning.
To fix that we will build special PHP version that will be used by PHPBrew, please confirm this action.`
                });

                if (userConfirmation) {
                    return task.newListr(
                        installPHPForPHPBrew,
                        {
                            rendererOptions: {
                                collapse: false
                            }
                        }
                    );
                }
            }
        }
    }
});

module.exports = checkPHPVersion;
