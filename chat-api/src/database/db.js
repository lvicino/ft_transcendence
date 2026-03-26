const postgres = require("postgres");

const sql = postgres({
  host                 : 'databse',
  port                 : 5432,
  database             : process.env.CHAT_DB,
  username             : process.env.CHAT_DB_USER,
  password             : process.env.CHAT_DB_PASSWORD,
  ssl                  : 'require',
});

const sleep = (ms) => { return new Promise((resolve) => {setTimeout(resolve, ms)}) };

async function initDb() {
    for (let t = 1; t < 5; t++) {
        try {
            await sql.begin(async (sql) => {

                await sql`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
					username TEXT NOT NULL
                );
                `;

                await sql`
                CREATE TABLE IF NOT EXISTS friends (
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, friend_id)
                );
                `;

            });

            console.log('Chat database schema checked and initialized.');
            return ;

        } catch (error) {
            console.error('Database DDL error:', error);
            console.error(`Retrying database connection in ${1 * t}s`);
            await sleep(1000 * t);
        }
    }
    process.exit(1);
}

module.exports = {sql, initDb};