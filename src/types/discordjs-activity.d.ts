import 'discord.js';
import type { EventHandler } from '../src/core/EventHandler';

declare module 'discord.js' {
  interface Client {
    currentActivityType?: number | null;
    eventHandler?: EventHandler;
  }
}