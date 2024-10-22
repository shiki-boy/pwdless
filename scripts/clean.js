import { JSONFilePreset } from "lowdb/node"

const db = await JSONFilePreset("./db.json", {})

db.data.users = []
db.data.passkeys = []
await db.write()
