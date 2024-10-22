import { z } from "zod"
import { db } from "../index.js"

export const User = z.object({
    username: z.string(),
    id: z.number(),
    challenge: z.string().optional()
})

export type User = z.infer<typeof User>

export const createUser = async (data: Omit<User, "id">) => {
    const id = Date.now()
    console.log(data)
    db.data.users.push({
        id,
        username: data.username,
        challenge: data.challenge
    })
    await db.write()
}

export const getUserByUsername = (username: string) => {
    return db.data.users.find((u) => u.username === username)
}
