const dependenciesForPlatforms = {
    darwin: {
        dependencies: [
            'zlib',
            'bzip2',
            'libiconv',
            'libzip',
            'libsodium',
            'curl',
            'libpng',
            'gd',
            'freetype',
            'oniguruma',
            'icu4c',
            'libxml2',
            'openssl@1.1'
        ],
        installCommand: (deps) => `brew install ${deps}`,
        packageManager: 'brew'
    },
    'Arch Linux': {
        dependencies: [
            'freetype2',
            'openssl',
            'oniguruma',
            'libxslt',
            'bzip2',
            ['libjpeg', 'libjpeg-turbo', 'libjpeg6-turbo'],
            'libpng',
            'icu',
            'libxml2',
            'autoconf',
            'libzip',
            'sqlite',
            'readline',
            'perl',
            'libsodium'
        ],
        installCommand: (deps) => `sudo pacman -S ${deps} --noconfirm`,
        packageManager: 'pacman'
    },
    Fedora: {
        dependencies: [
            'openssl-devel',
            'libjpeg-turbo-devel',
            'libpng-devel',
            'gd-devel',
            'libicu',
            'libicu-devel',
            'libzip-devel',
            'libsodium',
            'libsodium-devel',
            'libtool-ltdl-devel',
            'oniguruma-devel'
        ],
        installCommand: (deps) => `sudo yum install ${deps} -y`,
        packageManager: 'yum'
    },
    CentOS: {
        dependencies: [
            'openssl-devel',
            'libjpeg-turbo-devel',
            'libpng-devel',
            'gd-devel',
            'libicu',
            'libicu-devel',
            'libzip-devel',
            'libsodium',
            'libsodium-devel',
            'libtool-ltdl-devel',
            'oniguruma-devel'
        ],
        installCommand: (deps) => `sudo yum install --enablerepo=PowerTools ${deps} -y`,
        packageManager: 'yum'
    },
    Ubuntu: {
        dependencies: [
            'libcurl4-openssl-dev',
            'libonig-dev',
            'libjpeg-dev',
            'libjpeg8-dev',
            'libjpeg-turbo8-dev',
            'libpng-dev',
            'libicu-dev',
            'libfreetype6-dev',
            'libzip-dev',
            'libssl-dev',
            'build-essential',
            'libbz2-dev',
            'libreadline-dev',
            'libsodium-dev',
            'libsqlite3-dev',
            'libxml2-dev',
            ['libxslt-dev', 'libxslt1-dev'],
            'libonig-dev',
            'php-cli',
            'php-bz2',
            'pkg-config',
            'autoconf',
            'cmake'
        ],
        installCommand: (deps) => `sudo apt install ${deps} -y`,
        packageManager: 'apt'
    }
};

module.exports = dependenciesForPlatforms;
