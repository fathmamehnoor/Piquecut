import React from 'react'; // Import React
import GeneralContextProvider from "../GeneralContextProvider.js";
import Home from "./Home.js";


function App() {
    return (
        <div className="App">
            <div className='navbar'>
                <span className='header'>Piquecut</span>
            </div>
            <GeneralContextProvider>
                <Home/>
            </GeneralContextProvider>
        </div>
    );
}

export default App;
