import React, { useEffect, useRef } from "react";

const Canvas = (props) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let img = new Image();
        
        img.src = URL.createObjectURL(props.file);

       img.onload = () => {
            context.drawImage(img, 0, 0, 120, 140);
        };
    }, [props.file]);

    return <canvas className="image" ref={canvasRef} height={props.height} width={props.width} />;
};

export default Canvas;

