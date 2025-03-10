const fs = require('fs');
const path = require('path');
const { baseConfig } = require('.');
const pathExists = require('../util/path-exists');
const {
    getPort,
    getPortsConfig,
    defaultPorts
} = require('./port-config');

const portConfigPath = path.join(baseConfig.cacheDir, 'port-config.json');

/**
 * Get available ports on the system
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getAvailablePorts = () => ({
    title: 'Getting available ports',
    task: async (ctx) => {
        let ports = { ...defaultPorts };

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(
                    portConfigPath,
                    'utf-8'
                )
            );
        }
        const {
            systemConfiguration: {
                useNonOverlappingPorts
            }
        } = ctx;
        const availablePorts = await getPortsConfig(ports, {
            useNonOverlappingPorts
        });

        if (ctx.port) {
            const isPortAvailable = (await getPort(ctx.port)) === ctx.port;
            if (!isPortAvailable) {
                throw new Error(`Port ${ctx.port} is not available`);
            } else {
                availablePorts.app = ctx.port;
            }
        }

        // eslint-disable-next-line no-param-reassign
        ctx.ports = availablePorts;
    }
});

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getCachedPorts = () => ({
    title: 'Getting cached ports',
    task: async (ctx) => {
        let ports;

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(
                    portConfigPath,
                    'utf-8'
                )
            );
        } else {
            ports = { ...defaultPorts };
        }

        // eslint-disable-next-line no-param-reassign
        ctx.ports = ports;
    }
});

module.exports = {
    getAvailablePorts,
    getCachedPorts
};
