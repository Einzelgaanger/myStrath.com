declare module 'memorystore' {
  import { Store } from 'express-session';

  interface MemoryStoreOptions {
    checkPeriod?: number;
  }

  function memorystore(session: any): typeof Store;
  export = memorystore;
} 