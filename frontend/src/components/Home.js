import React, { useContext, useState } from "react";
import { GeneralContext } from "../GeneralContextProvider.js";
import Popup from "./Popup.js";
import Carousel from "./Carousel.js";
import ImageDimensionsPopup from "./ImageDimensionsPopup.js";
import axios from 'axios';

const Home = () => {
    const { files, setFiles, popup, setPopup } = useContext(GeneralContext);
    const [imageDimensionsPopupVisible, setImageDimensionsPopupVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [imageDimensions] = useState({});
    const [loading, setLoading] = useState(false); // State to manage loading state
    const [setLayoutImageURL] = useState('');

    const handleFile = (e) => {
        console.log("handleFile called");
        const newFiles = [...e.target.files].filter(file => file.type === "image/jpeg" || file.type === "image/png");

        if (files.length + newFiles.length <= 20) {
            if (newFiles.length > 0) {
                setCurrentFile(newFiles[0]);
                console.log("File selected:", newFiles[0]);
                setImageDimensionsPopupVisible(true);
            } else {
                setPopup({ show: true, message: "Please select a valid image file.", timeout: 5 });
            }
        } else {
            setPopup({ show: true, message: "Exceeded limit of 20 images.", timeout: 5 });
        }
    };

    const handleSaveDimensions = (width, height) => {
        console.log("handleSaveDimensions called with width:", width, "height:", height);
        const newFileWithDimensions = {
            file: currentFile,  // Store the File object directly
            name: currentFile.name,
            width,
            height
        };
        console.log("New file with dimensions:", newFileWithDimensions);
        setFiles([...files, newFileWithDimensions]);
        setImageDimensionsPopupVisible(false);  // Assuming you want to close the popup after saving dimensions
    };
    
    
    

    const clearQueue = () => {
        console.log("clearQueue called");
        if (files.length > 0) {
            setFiles([]);
            setPopup({ show: true, message: "Queue cleared.", timeout: 5 });
        }
    };

    
    const handlePredict = async () => {
        setLoading(true);
        try {
            console.log("Sending dataset:", files);
    
            // Prepare the dataset to send to the backend
            const dataset = await Promise.all(files.map(async file => {
                const base64String = await convertFileToBase64(file.file);
                return {
                    name: file.name,
                    image: base64String,
                    width: file.width,
                    height: file.height
                };
            }));
    
            // Send POST request to predict endpoint
            const response = await axios.post('http://localhost:5000/predict', { observation: dataset });
    
            // Assuming the response contains image_path
            setLayoutImageURL(response.data.image_path);
        } catch (error) {
            console.error('Error predicting:', error);
        } finally {
            setLoading(false);
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };


    return (
        <>
            {popup.show && <Popup message={popup.message} onClose={() => setPopup({ show: false, message: "" })} />}
            <div className="container">
                <div className="horizontal-layout">
                    <div className="box upload-box">
                        <div className="wrapper">
                            <span className="text">+</span>
                            <p className="prompt">Click or drag and drop files here to upload</p>
                            <input id="file-upload" type="file" multiple accept="image/png, image/jpeg" onChange={handleFile} />
                        </div>
                    </div>
                    <Carousel files={files} imageDimensions={imageDimensions} />
                </div>
                <div className="button_container">
                    <button className="action clear_queue" onClick={clearQueue} disabled={loading}>Clear queue</button>
                    <button className="action sticker_layout" onClick={handlePredict} disabled={loading}>Place Stickers</button>
                </div>
                {loading && <p>Loading...</p>}
            </div>
            {imageDimensionsPopupVisible && (
                <ImageDimensionsPopup
                    onClose={() => setImageDimensionsPopupVisible(false)}
                    onSave={handleSaveDimensions}
                />
            )}
        </>
    );
};
export default Home;
