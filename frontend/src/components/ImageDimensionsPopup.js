import React, { useState } from "react";

const ImageDimensionsPopup = ({ onClose, onSave }) => {
    const [width, setWidth] = useState();
    const [height, setHeight] = useState();

    const handleSave = () => {
        onSave(width, height);
        onClose();
    };

    return (
        <div className="popup">
            <div className="popup-content">
                <h3>Set Minimum Printed Size</h3>
                <div className="input-group">
                    <label htmlFor="width">Width:</label>
                    <input
                        type="number"
                        id="width"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="height">Height:</label>
                    <input
                        type="number"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ImageDimensionsPopup;
