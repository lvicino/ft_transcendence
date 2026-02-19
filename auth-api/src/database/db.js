const postgres = require("postgres");

const sql = postgres({
  host                 : 'databse', // hard coding un peut
  port                 : 5432,
  database             : process.env.AUTH_DB,
  username             : process.env.AUTH_DB_USER,
  password             : process.env.AUTH_DB_PASSWORD,
  ssl                  : 'require',
});

const sleep = (ms) => { return new Promise((resolve) => {setTimeout(resolve, ms)}) };

async function initDb() {
    for (let t = 1; t < 5; t++) {
        try {
            await sql.begin(async (sql) => { 
                
                await sql`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL
                );
                `;

                await sql`
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                `;
            });

            console.log('Schéma de base de données vérifié et initialisé.');
            return ;

        } catch (error) {
            console.error('Erreur critique DDL (Data Definition Language) :', error);
            console.error(`Retrying database connection in ${1 * t}s`);
            await sleep(1000 * t);
        }
    }
    process.exit(1);
}

module.exports = {sql, initDb};