import { MemoryStore, ExecutionContext } from '../types';

export class MemoryManager {
  private store: MemoryStore;

  constructor() {
    this.store = {
      shortTerm: new Map(),
      longTerm: new Map(),
    };
  }

  getStore(): MemoryStore {
    return this.store;
  }

  static createContextMemory(): MemoryStore {
    return {
      shortTerm: new Map(),
      longTerm: new Map(),
    };
  }

  static storeShortTerm(ctx: ExecutionContext, key: string, value: unknown, ttlMs = 300000): void {
    ctx.memory.shortTerm.set(key, {
      value,
      timestamp: Date.now() + ttlMs,
    });
  }

  static retrieveShortTerm(ctx: ExecutionContext, key: string): unknown | undefined {
    const entry = ctx.memory.shortTerm.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.timestamp) {
      ctx.memory.shortTerm.delete(key);
      return undefined;
    }
    return entry.value;
  }

  static storeLongTerm(ctx: ExecutionContext, key: string, value: unknown): void {
    ctx.memory.longTerm.set(key, value);
  }

  static retrieveLongTerm(ctx: ExecutionContext, key: string): unknown | undefined {
    return ctx.memory.longTerm.get(key);
  }

  static clearMemory(ctx: ExecutionContext, type: 'short-term' | 'long-term' | 'all'): void {
    if (type === 'short-term' || type === 'all') {
      ctx.memory.shortTerm.clear();
    }
    if (type === 'long-term' || type === 'all') {
      ctx.memory.longTerm.clear();
    }
  }
}
