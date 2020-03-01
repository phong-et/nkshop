var path = require('path');
var pathFolder = path.dirname(require.main.filename).split(path.sep)
pathFolder.pop()
pathFolder.pop()
console.log(pathFolder.join('\\'))
console.log(path.sep)