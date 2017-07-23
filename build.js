const fs = require('fs');
const path = require('path');

const metalsmith = require('metalsmith');
const layouts = require('metalsmith-layouts');
const inPlace = require('metalsmith-in-place');

const postcss = require('postcss');
const precss = require('precss');
const rimraf = require('rimraf');

function preBuildActions() {
    // first clean the build.
    console.log('Cleaning built files...');
    rimraf.sync('index.html');
    rimraf.sync('experiments.html');
    rimraf.sync('css');
}

preBuildActions();

function postCss() {
    const baseCssSrcPath = path.join(__dirname, '_site_src', 'css');
    const baseCssDestPath = path.join(__dirname, 'css');
    let cssFiles = [];
    try {
        cssFiles = fs.readdirSync(baseCssSrcPath);
    } catch(e) {}

    return Promise.all(cssFiles.map(file => {
        const cssPath = path.join(baseCssSrcPath, file);
        const destPath = path.join(baseCssDestPath, file);
        const css = fs.readFileSync(cssPath, 'utf8');
        return postcss([precss])
            .process(css, {from: cssPath, to: destPath})
            .then(result => {
                fs.writeFileSync(destPath, result.css);
            }).catch(e => {
                console.log('post css fail!', e);
                throw e;
            });
    }));
}

if (process.argv[2] !== 'clean') {
    console.log('Starting metalsmith build...');
    metalsmith(__dirname)
        .use(inPlace())
        .use(layouts({
            engine: 'handlebars',
            directory: '_layouts'
        }))
        .source('_site_src')
        .destination('.')
        .clean(false)
        .build((err, files) => {
            if (err) {
                console.error('Build Fail!', err);
                throw err;
            }
            postCss().then(() => {
                console.log('Done!');
            });
        });
}
