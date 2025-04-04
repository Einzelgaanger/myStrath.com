declare module 'express-session' {
  import { Request } from 'express';

  interface SessionData {
    [key: string]: any;
  }

  interface Session extends SessionData {
    id: string;
    cookie: Cookie;
    regenerate(callback: (err: any) => void): void;
    save(callback?: (err?: any) => void): void;
    touch(): void;
    destroy(callback?: (err?: any) => void): void;
  }

  interface Cookie {
    originalMaxAge: number | undefined;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
    path?: string;
    expires?: Date;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  }

  interface Store {
    all(callback: (err: any, obj?: { [sid: string]: Session }) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    get(sid: string, callback: (err: any, session?: Session | null) => void): void;
    set(sid: string, session: Session, callback?: (err?: any) => void): void;
    touch(sid: string, session: Session, callback?: (err?: any) => void): void;
  }

  interface SessionOptions {
    cookie?: Cookie;
    name?: string;
    resave?: boolean;
    rolling?: boolean;
    saveUninitialized?: boolean;
    secret?: string | string[];
    store?: Store;
    unset?: 'destroy' | 'keep';
  }

  interface RequestWithSession extends Request {
    session: Session;
    sessionID: string;
  }

  function session(options?: SessionOptions): any;
  export = session;
} 