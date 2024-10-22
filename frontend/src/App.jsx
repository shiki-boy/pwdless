import "./App.css"

function App() {
    const getOptions = async () => {
        const res = await fetch("/api/ping")
        console.log(await res.json())
    }

    return (
        <>
            <p>Hello</p>

            <button onClick={getOptions}>Click</button>
        </>
    )
}

export default App
