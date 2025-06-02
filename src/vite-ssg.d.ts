// src/vite-ssg.d.ts
import type { ViteSSGOptions } from 'vite-ssg'

declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ViteSSGOptions
  }
}