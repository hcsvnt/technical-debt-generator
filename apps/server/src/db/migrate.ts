#!/usr/bin/env bun
/** Manual escape hatch; the server also migrates on boot. */
import { createDb } from "./client";

createDb();
console.log("✅ migrations applied");
