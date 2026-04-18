import { Pool, PoolClient } from 'pg';

// 数据库连接池
let pool: Pool | null = null;

/**
 * 获取数据库连接池
 */
function getPool(): Pool {
	if (!pool) {
		// 优先使用环境变量（支持多种命名方式）
		const connectionString =
			process.env.PGDATABASE_URL ||
			process.env.DATABASE_URL ||
			process.env.COZE_SUPABASE_DATABASE_URL ||
			`postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

		// 检测是否需要 SSL
		const needsSSL =
			connectionString.includes('volces.com') ||
			connectionString.includes('sslmode=require') ||
			process.env.DB_SSL === 'true';

		pool = new Pool({
			connectionString,
			ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000,
		});

		pool.on('error', (err) => {
			console.error('Unexpected database pool error:', err);
		});
	}

	return pool;
}

/**
 * 执行查询
 */
export async function query<T = Record<string, unknown>>(
	text: string,
	params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
	const pool = getPool();
	const result = await pool.query(text, params);
	return { rows: result.rows as T[], rowCount: result.rowCount };
}

/**
 * 获取单个客户端（用于事务）
 */
export async function getClient(): Promise<PoolClient> {
	const pool = getPool();
	return pool.connect();
}

/**
 * 执行事务
 */
export async function transaction<T>(
	callback: (client: PoolClient) => Promise<T>
): Promise<T> {
	const client = await getClient();
	try {
		await client.query('BEGIN');
		const result = await callback(client);
		await client.query('COMMIT');
		return result;
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

/**
 * 关闭连接池
 */
export async function closePool(): Promise<void> {
	if (pool) {
		await pool.end();
		pool = null;
	}
}
