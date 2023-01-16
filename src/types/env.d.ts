declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      MONGO: string;
    }
  }
}

export {};
