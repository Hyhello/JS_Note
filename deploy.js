var ghPages = require('gh-pages');

ghPages.publish('dist', {
    branch: 'master',
    add: true
});
