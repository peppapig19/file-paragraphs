const fsp = require('fs/promises');
const process = require('process');
const path = require('path');

const folderPath = path.join(process.cwd(), '/test'); //хранение html/htm файлов: папка исполняемого скрипта (не модуля) + /test
const searchString = 'hello';

//получать список всех файлов '*.html' и '*.htm' в некоторой папке
async function readHtmlFiles() {
    try {
        const htmlFiles = await fsp.readdir(folderPath) //получить асинхронно имена всех файлов в папке /test
            .then(result => result.filter(file => {
                const extname = path.extname(file).toLowerCase();
                return extname === '.html' || extname === '.htm'; //фильтрация по расширению
            }));

        //получить абсолютный путь к каждому html/htm файлу и асинхронно прочитать его
        htmlFiles.forEach(async file => await readFile(path.join(folderPath, file)));
    } catch (error) {
        console.error('Error:', error);
    }
};

async function readFile(file) {
    try {
        const content = await fsp.readFile(file, 'utf-8'); //асинхронное чтение файла
        const paragraphCount = getParagraphCount(content);
        console.log(`File: ${path.basename(file)}, Paragraphs matching '${searchString}': ${paragraphCount}`);
    } catch (error) {
        console.error('Error:', error);
    }
};

//разбирать прочитанный файл, получать информацию о количестве параграфов (тегов <P ...>...</P>), содержащих некоторую подстроку
function getParagraphCount(content) {
    //искать 'hello' в начале, середине или конце параграфа, [\\s\\S]*? - любые символы в любом кол-ве в ленивом режиме (наименьшие совпадения)
    //параграф может иметь атрибуты, \b - граница слова (названия элемента), [^>]* - любые символы в любом кол-ве, кроме > (конца открывающего тега)
    //получать массив всех вхождений (g), регистр не учитывать (i)
    const regex = new RegExp(`<p\\b[^>]*>[\\s\\S]*?${searchString}[\\s\\S]*?</p>`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
};

exports.readHtmlFiles = async () => {
    return await readHtmlFiles();
}