import { z } from "zod"
import type {
    AuthenticatorTransportFuture,
    CredentialDeviceType,
} from "@simplewebauthn/types"

import { db } from "../index.js"

const zCredentialDeviceType = z.custom<CredentialDeviceType>(
    (val: CredentialDeviceType) => {
        return val === "multiDevice" || val === "singleDevice"
    }
)

const zAuthenticatorTransportFuture = z.custom<AuthenticatorTransportFuture>(
    (val: AuthenticatorTransportFuture) => {
        if (
            val == "ble" ||
            val === "cable" ||
            val === "hybrid" ||
            val === "internal" ||
            val === "nfc" ||
            val === "smart-card" ||
            val === "usb"
        ) {
            return true
        }
    }
)

export const Passkey = z.object({
    id: z.string(),
    publicKey: z.array(z.number().positive()),
    userId: z.number(),
    webauthnUserID: z.string(),
    counter: z.number(),
    deviceType: zCredentialDeviceType,
    backedUp: z.boolean(),
    transports: zAuthenticatorTransportFuture,
})

export type Passkey = z.infer<typeof Passkey>

export const createPasskey = async (data: Passkey) => {
    const passkey = { ...data }
    db.data.passkeys.push(passkey)
    await db.write()
}
