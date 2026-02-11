const postgres = require("postgres");

const sql = postgres({
  host                 : 'databse', // hard coding un peut
  port                 : 5432, // ?
  database             : process.env.AUTH_DB,
  username             : process.env.AUTH_DB_USER,
  password             : process.env.AUTH_DB_PASSWORD,
});

async function initDb() {
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

    } catch (error) {
        console.error('Erreur critique DDL (Data Definition Language) :', error);
        process.exit(1);
    }
}

module.exports = {sql, initDb};