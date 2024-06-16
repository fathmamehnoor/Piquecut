import React, { useState, createContext } from "react";

export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", timeout: 0 });
    const [imageWidth, setImageWidth] = useState(120);
    const [imageHeight, setImageHeight] = useState(140);

    return (
        <GeneralContext.Provider value={{ files, setFiles, popup, setPopup, imageWidth, setImageWidth, imageHeight, setImageHeight }}>
            {children}
        </GeneralContext.Provider>
    );
};

export default GeneralContextProvider;
