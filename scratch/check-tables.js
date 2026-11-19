import fs from 'fs';

const sql = fs.readFileSync('backups/cedar_complete_schema.sql', 'utf8');
const tables = [];
const regex = /CREATE TABLE IF NOT EXISTS public\."([^"]+)"/g;
let m;
while ((m = regex.exec(sql)) !== null) {
  tables.push(m[1]);
}
console.log('Total tables in schema:', tables.length);

const data = JSON.parse(fs.readFileSync('backups/cedar_data_dump.json', 'utf8'));
const dataTables = Object.keys(data);
console.log('Total tables in data dump:', dataTables.length);

const missingFromData = tables.filter(t => !data.hasOwnProperty(t));
console.log('Tables in schema not in data dump (' + missingFromData.length + '):', missingFromData);

const missingFromSchema = dataTables.filter(t => !tables.includes(t));
console.log('Tables in data dump not in schema (' + missingFromSchema.length + '):', missingFromSchema);
