const { promisify } = require('util');
const { resolve, basename, extname } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const end = `
</div>
</body>
</html>
`

var webpage = `
<!doctype html>
<html>
  <head>
    <title>Soundboard</title>
    <style>
{
    box-sizing: border-box;
}
/* Set additional styling options for the columns */
.column {
float: left;
}

/* Set width length for the left, right and middle columns */
.left {
width: 30%;
}

.middle {
width: 30%;
}

.right {
width: 30%;
}

.row:after {
content: "";
display: table;
clear: both;
}
</style>
  </head>
  <body style='background-color: #5a7369;'>
  <div class="column left">
  `

  async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() 
      ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
  }

  async function run() {
  await getFiles('./sounds').then(files => {
    var i = 0;
    var j = 0;
    var group = 'sounds';
    for (const file of files) {

        var pathElements = file.replace(/\/$/, '').split('/');
        var lastFolder = pathElements[pathElements.length - 2];
        console.log(lastFolder)

        if (group!=lastFolder) {
            var header = `
            <h3 style='font-family:verdana; color:white;'>${lastFolder}<h1>
            `
            if (i >= files.length * 0.6 && j>0) {
                header = `
                </div>
                <div class="column right">
                <h3 style='font-family:verdana; color:white;'>${lastFolder}<h1>
                `
                j=0
            }
            if (i >= files.length * 0.3 && j>0) {
                header = `
                </div>
                <div class="column middle">
                <h3 style='font-family:verdana; color:white;'>${lastFolder}<h1>
                `
                j=0;
            }
            webpage+=header;
            group = lastFolder
            j=0
        }

    var extension = extname(file);
    if (extension != '.mp3' && extension != '.wav' && extension != '.ogg') {
        continue;
    }

    let label = basename(file, extension).split('-').join(' ');

    var content = `
    <audio id="${i}" src="${file}" preload="auto"></audio>
  <button style="padding: 10px 15px;text-align: center;width: 200px; white-space: normal; word-wrap: break-word;" onclick="document.getElementById('${i}').play();"><div style="font-family:helvetica;><b">${label}</b></div></button>
  `
    webpage += content;
    i++;
    j++;

    }

  }).catch(e => console.log(e))

  webpage += end;
  fs.writeFile('./soundboard.html', webpage, err => {
      if (err) {
        console.error(err);
      }
      // file written successfully
    });
}

run();