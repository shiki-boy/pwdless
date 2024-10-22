import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { etag } from "hono/etag"
import { logger } from "hono/logger"
import { JSONFilePreset } from "lowdb/node"
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    type GenerateRegistrationOptionsOpts,
    type VerifiedRegistrationResponse,
    type VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server"

import type { DbDataType } from "./types.js"
import { createUser, getUserByUsername } from "./models/User.js"
import type { RegistrationResponseJSON } from "@simplewebauthn/types"

export const db = await initDb()
const rpID = "localhost"

const app = new Hono()

app.use(etag(), logger())

app.get("/api/ping", async (c) => {
    return c.text("pong")
})

app.post("/api/generate-registration-options", async (c) => {
    console.log(c.body)
    const { username } = (await c.req.json()) as { username: string }

    let credentials: any[] = []

    const opts: GenerateRegistrationOptionsOpts = {
        rpName: "SimpleWebAuthn Example",
        rpID,
        userName: username,
        timeout: 60000,
        attestationType: "none",
        /**
         * Passing in a user's list of already-registered credential IDs here prevents users from
         * registering the same authenticator multiple times. The authenticator will simply throw an
         * error in the browser if it's asked to perform registration when it recognizes one of the
         * credential ID's.
         */
        excludeCredentials: credentials.map((cred) => ({
            id: cred.id,
            type: "public-key",
            transports: cred.transports,
        })),
        authenticatorSelection: {
            residentKey: "discouraged",
            /**
             * Wondering why user verification isn't required? See here:
             *
             * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
             */
            userVerification: "preferred",
        },
        /**
         * Support the two most common algorithms: ES256, and RS256
         */
        supportedAlgorithmIDs: [-7, -257],
    }

    const options = await generateRegistrationOptions(opts)

    console.log({ options })

    await createUser({ username, challenge: options.challenge })

    return c.json(options)
})

app.post("/api/verify-registration", async (c) => {
    const { username, regResponse } = (await c.req.json()) as {
        regResponse: RegistrationResponseJSON
        username: string
    }

    const user = getUserByUsername(username)

    const savedChallenge = user!.challenge

    let verification: VerifiedRegistrationResponse

    try {
        const opts: VerifyRegistrationResponseOpts = {
            response: regResponse,
            expectedChallenge: `${savedChallenge}`,
            expectedOrigin: "http://localhost:5173",
            expectedRPID: rpID,
            requireUserVerification: false,
        }
        verification = await verifyRegistrationResponse(opts)
    } catch (error) {
        const _error = error as Error
        console.error(_error)
        return c.json({ error }, 400)
    }

    const { verified, registrationInfo } = verification

    console.log(registrationInfo?.credential)

    return c.json(verification)

    // const existingCredential = user.credentials.find(
    //     (cred) => cred.id === credential.id
    // )

    // if (!existingCredential) {
    //     /**
    //      * Add the returned credential to the user's list of credentials
    //      */
    //     const newCredential: WebAuthnCredential = {
    //         id: credential.id,
    //         publicKey: credential.publicKey,
    //         counter: credential.counter,
    //         transports: body.response.transports,
    //     }
    //     user.credentials.push(newCredential)
    // }
})

const port = 8000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port,
})

async function initDb() {
    return await JSONFilePreset<DbDataType>("./db.json", {
        users: [],
        passkeys: [],
    })
}
