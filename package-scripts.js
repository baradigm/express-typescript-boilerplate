const { series, rimraf } = require('nps-utils');

module.exports = {
    scripts: {
        default: 'nps start',
        // start built app from the dist directory
        start: {
            script: 'node dist/app.js',
            description: 'Starts the built app',
        },
        // serves the current app and watches for changes to restart it
        serve: {
            inspector: {
                script: series(
                    'nps banner.serve',
                    'nodemon --watch src --inspect'
                ),
                description: 'Serves the current app and watches for changes to restart it, you may attach inspector to it.'
            },
            script: series(
                'nps banner.serve',
                'nodemon --watch src'
            ),
            description: 'Serves the current app and watches for changes to restart it'
        },
        // creates the needed configuration files
        config: {
            script: series(
                runFast('./commands/tsconfig.ts'),
            ),
            hiddenFromHelp: true
        },
        // builds the main app into the dist directory
        build: {
            script: series(
                'nps banner.build',
                'nps config',
                'nps lint',
                'nps clean.dist',
                'nps transpile',
                'nps copy',
                'nps copy.tmp',
                'nps clean.tmp',
            ),
            description: 'Builds the main app into the dist directory'
        },
        // runs TSLint over your project
        lint: {
            script: tslint(`./src/**/*.ts`),
            hiddenFromHelp: true
        },
        // transpile your app into javascript
        transpile: {
            script: `tsc --project ./tsconfig.build.json`,
            hiddenFromHelp: true
        },
        // clean files and folders
        clean: {
            default: {
                script: series(
                    `nps banner.clean`,
                    `nps clean.dist`
                ),
                description: 'Deletes the ./dist folder'
            },
            dist: {
                script: rimraf('./dist'),
                hiddenFromHelp: true
            },
            tmp: {
                script: rimraf('./.tmp'),
                hiddenFromHelp: true
            }
        },
        // copies static files to the build folder
        copy: {
            default: {
                script: series(
                    `nps copy.public`
                ),
                hiddenFromHelp: true
            },
            public: {
                script: copy(
                    './src/client/*',
                    './dist'
                ),
                hiddenFromHelp: true
            },
            tmp: {
                script: copyDir(
                    './.tmp',
                    './dist'
                ),
                hiddenFromHelp: true
            }
        },
        // these run various kinds of tests. Default is all tests.
        test: {
            default: 'nps test.unit && nps test.integration',
            unit: {
                default: {
                    script: series(
                        'nps banner.testUnit',
                        'nps test.unit.pretest',
                        'nps test.unit.run'
                    ),
                    description: 'Runs the unit tests'
                },
                pretest: {
                    script: tslint(`./test/unit/**.ts`),
                    hiddenFromHelp: true
                },
                run: {
                    script: 'ts-mocha --paths -p tsconfig.json ./test/unit/**/**.ts',
                    hiddenFromHelp: true
                }
            },
            integration: {
                default: {
                    script: series(
                        'nps banner.testIntegration',
                        'nps test.integration.pretest',
                        'nps test.integration.run'
                    ),
                    description: 'Runs the integration tests'
                },
                pretest: {
                    script: tslint(`./test/integration/**.ts`),
                    hiddenFromHelp: true
                },
                run: {
                    script: 'ts-mocha --paths -p tsconfig.json ./test/integration/**/**.ts',
                    hiddenFromHelp: true
                }
            }
        },
        // this creates pretty banner to the terminal
        banner: {
            build: banner('build'),
            serve: banner('serve'),
            testUnit: banner('test.unit'),
            testIntegration: banner('test.integration'),
            clean: banner('clean')
        }
    }
};

function banner(name) {
    return {
        hiddenFromHelp: true,
        silent: true,
        description: `Shows ${name} banners to the console`,
        script: runFast(`./commands/banner.ts ${name}`),
    };
}

function copy(source, target) {
    return `copyfiles --up 1 ${source} ${target}`;
}

function copyDir(source, target) {
    return `ncp ${source} ${target}`;
}

function run(path) {
    return `ts-node ${path}`;
}

function runFast(path) {
    return `ts-node --transpileOnly ${path}`;
}

function tslint(path) {
    return `tslint -c ./tslint.json ${path} --format stylish`;
}
