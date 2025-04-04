declare module 'pg' {
  export interface PoolConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    application_name?: string;
  }

  export interface QueryConfig {
    text: string;
    values?: any[];
    rowMode?: string;
    types?: any;
  }

  export interface QueryResult {
    rows: any[];
    rowCount: number;
    command: string;
    fields: FieldInfo[];
  }

  export interface FieldInfo {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
    query(text: string, values?: any[]): Promise<QueryResult>;
    query(config: QueryConfig): Promise<QueryResult>;
    on(event: string, callback: Function): this;
  }

  export class PoolClient {
    query(text: string, values?: any[]): Promise<QueryResult>;
    query(config: QueryConfig): Promise<QueryResult>;
    release(): void;
    end(): Promise<void>;
    on(event: string, callback: Function): this;
  }

  export class Client {
    constructor(config?: PoolConfig);
    connect(): Promise<void>;
    end(): Promise<void>;
    query(text: string, values?: any[]): Promise<QueryResult>;
    query(config: QueryConfig): Promise<QueryResult>;
    on(event: string, callback: Function): this;
  }
} 