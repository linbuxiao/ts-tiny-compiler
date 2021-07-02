export type getType<T> = T extends any ? { [P in keyof T]: P extends "type" ? T[P] : never }[keyof T]: never
