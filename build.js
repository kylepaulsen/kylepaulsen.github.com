const metalsmith = require('metalsmith');
const layouts = require('metalsmith-layouts');

const rimraf = require('rimraf');

function preBuildActions() {
    // first clean the build.
    console.log('Cleaning built files...');
    rimraf.sync('index.html');
    rimraf.sync('experiments.html');
}

preBuildActions();

if (process.argv[2] !== 'clean') {
    console.log('Starting metalsmith build...');
    metalsmith(__dirname)
        .use(layouts({
            engine: 'handlebars',
            directory: '_layouts'
        }))
        .source('_site_src')
        .destination('.')
        .clean(false)
        .build(function(err, files) {
            if (err) {
                console.error('Build Fail!', err);
                throw err;
            }
            console.log('Done!');
        });
}
