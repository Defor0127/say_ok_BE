import 'express';

declare module 'express' {
  export interface User {
    loginEmail: string;
    nickname: string;
    role: string;
  }
}
