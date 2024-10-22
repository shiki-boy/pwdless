import { startRegistration } from "@simplewebauthn/browser"

import "./App.css"

function App() {
    const getOptions = async () => {
        const res = await fetch("/api/generate-registration-options", {
            method: "POST",
            body: JSON.stringify({ username: "rk" }),
        })
        const options = await res.json()
        start(options)
    }

    const start = async (optionsJSON) => {
        let attResp
        try {
            // Pass the options to the authenticator and wait for a response
            attResp = await startRegistration({ optionsJSON })

            const res = await fetch("/api/verify-registration", {
                method: "POST",
                body: JSON.stringify({ username: "rk", regResponse: attResp }),
            })

            const verificationJSON = await res.json()

            console.log({ verificationJSON })
        } catch (error) {
            console.error(error)
            alert("Did not work")
        }

        console.log(attResp)
    }

    return (
        <>
            <p>Hello</p>

            <button onClick={getOptions}>Click</button>
        </>
    )
}

export default App
