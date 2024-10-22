import type { Low } from "lowdb"
import type { User } from "./models/User.js"
import type { Passkey } from "./models/Passkey.js"

export type DbDataType = { users: User[]; passkeys: Passkey[] }
export type DbType = Low<DbDataType>
