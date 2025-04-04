declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  import { Pool, PoolConfig } from 'pg';

  interface PGStoreOptions {
    pool?: Pool;
    tableName?: string;
    createTableIfMissing?: boolean;
    pruneSessionInterval?: number | false;
    errorLog?: (err: Error) => void;
  }

  class PGStore extends Store {
    constructor(options?: PGStoreOptions);
    close(): void;
  }

  export = PGStore;
} 