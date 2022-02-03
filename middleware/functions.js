const { randomUUID } = require('crypto');

function zipFileName(format) {
    let uuid = randomUUID();
    let current_date = new Date();
    const dateFormatMap = {
        'yyyy' : current_date.getFullYear(),
        'yy': current_date.getFullYear().toString().slice(-2),
        'mm' : current_date.getMonth() + 1,
        'dd' : current_date.getDate()
    };

    zip_file_name = format.replace(/yyyy|yy|mm|dd/gi, matched => dateFormatMap[matched]) + '_' + uuid
    return zip_file_name;
}

module.exports = {zipFileName}

