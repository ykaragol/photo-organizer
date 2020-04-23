"use strict";

const fwalker = require('fwalker');
const exif = require('exifr');
const tableDumper = require('console.table');

function walk(targetDirectory) {
    return new Promise((resolve) => {
        const filePaths = []

        fwalker(targetDirectory)
            .on('file', function(relativePath, stats, absolutePath) {
                filePaths.push(absolutePath)
            })
            .on('done', function() {
                resolve(filePaths)
            })
            .on('error', function() {
                // ignore
            })
        .walk();
    })
}

const targetDirectory = process.argv[2]
if (!targetDirectory) {
    console.log('You have to pass path as parameter')
} else {
    const tableArr = []

    walk(targetDirectory).then((filePaths) => {
        Promise.all(
            filePaths.map((filePath) => {
                return exif.parse(filePath)
                    .then(output => {
                        return {
                            filePath,
                            latitude: output.latitude || '',
                            longitude: output.longitude || '',
                            dateTaken: output.DateTimeOriginal || ''
                        }
                    })
                    .then(entry => tableArr.push(entry))
                    .catch(_ => undefined)
            })
        )
        .then(() => {
            console.log(tableDumper.getTable(tableArr))
        })
    });
}
