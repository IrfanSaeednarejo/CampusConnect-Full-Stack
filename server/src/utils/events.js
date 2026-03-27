import { EventEmitter } from "events";

class AppEventEmitter extends EventEmitter { }
export const systemEvents = new AppEventEmitter();
