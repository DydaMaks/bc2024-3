const { Command } = require('commander');
const fs = require('fs');
const https = require('https');

const program = new Command();

// Додаємо обов'язковий параметр для вводу та необов'язкові параметри для виводу
program
  .requiredOption('-i, --input <file>', 'input file path')
  .option('-o, --output <file>', 'output file path')
  .option('-d, --display', 'display result in console');

program.parse(process.argv);

const options = program.opts();

// Перевіряємо, чи вказаний вхідний файл
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевіряємо, чи існує вхідний файл
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Сконструюй URL для запиту
const url = 'https://bank.gov.ua/NBUStatService/v1/statistics?date=20231001&period=quarter'; // Зміни URL відповідно до твоєї задачі

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Записуємо отримані дані у вхідний файл
    fs.writeFileSync(options.input, data);
    console.log('Data fetched successfully');
  });
}).on('error', (err) => {
  console.error('Error fetching data: ' + err.message);
});
// Читання даних із файлу data.json
const rawData = fs.readFileSync(options.input);
const jsonData = JSON.parse(rawData);

// Фільтрація даних за ключем 'parent' із значенням 'BS3_BanksLiab'
const filteredData = jsonData.filter(item => item.parent === 'BS3_BanksLiab');

// Форматування результату як '<indicator>:<value>'
const result = filteredData.map(item => `${item.indicator}:${item.value}`).join('\n');

// Якщо задано параметр --display, виводимо результат у консоль
if (options.display) {
  console.log(result);
}

// Якщо задано параметр --output, зберігаємо результат у файл
if (options.output) {
  fs.writeFileSync(options.output, result);
}
