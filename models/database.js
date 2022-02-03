const sqlite3 = require('sqlite3').verbose();
const db_file = './models/table.db'

function openConnection(dbFile) {
    let database = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, err => {
        if (err) {
            console.error(err.message);
        }
    });

    database.run(
        "CREATE TABLE IF NOT EXISTS 'ImageDirectory' (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, extension TEXT, image BLOB, created TEXT)"
      );

    // database.run(
    //     "DELETE FROM ImageDirectory"
    // );

    return database;
}

function closeConnection(database) {
    database.close(err => {
        if (err) {
            return console.error(err.message);
        }
    });
}

function showHistory() {
    let database = openConnection(db_file);
    return new Promise( (resolve, reject) => {
        let query = "SELECT name, extension, strftime('%d-%m-%Y', created) as created FROM ImageDirectory";
        database.all(query, [], (err, rows) => {
            closeConnection(database);
            if (err) {
                reject(err.message);
            }
            resolve(rows);
        });
    });
}

function getImagesById(idArray) {
    let database = openConnection(db_file);
    return new Promise( (resolve, reject) => {
        let placeholders = idArray.map(id => 'id = ?').join(' OR ');
        let newIdArray = idArray.map(id => id.id);
        let query = "SELECT name, image FROM ImageDirectory WHERE " + placeholders;
        database.all(query, newIdArray, (err, rows) => {
            closeConnection(database);
            if (err) {
                reject(err.message);
            }
            resolve(rows);
        });
    });
}

function getImagesByName(imgName) {
    let database = openConnection(db_file);
    return new Promise( (resolve, reject) => {
        let query = "SELECT name FROM ImageDirectory WHERE LOWER(name) LIKE ?";
        query_params = `%${imgName}%`;
        database.all(query, query_params, (err, rows) => {
            closeConnection(database);
            if (err) {
                reject(err.message);
            }
            resolve(rows);
        });
    });
}

function insertImageData(imgArray) {
    let database = openConnection(db_file);
    let placeholders = imgArray.map(imgData => (`(?, ?, ?, datetime('now', 'localtime'))`)).join(', ');
    let newImgArray = imgArray.map(img => [img.name, img.extension, img.image]).flat()
    let query = `INSERT INTO ImageDirectory (name, extension, image, created) VALUES ` + placeholders;

    database.run(query, newImgArray, err => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Rows inserted.");
    });

    closeConnection(database);
}

function truncateTable() {
    let database = openConnection(db_file);
    database.run("DELETE FROM ImageDirectory", [], err => {
        if (err) {
            return console.error(err.message);
        }
    });

    database.run("UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'ImageDirectory';", [], err => {
        if (err) {
            return console.error(err.message);
        }
    });
    closeConnection(database);
}

module.exports = {showHistory, insertImageData, getImagesById, getImagesByName, truncateTable}