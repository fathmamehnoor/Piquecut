import React, { useState, useContext, useRef, useCallback } from "react";
import { GeneralContext } from "../GeneralContextProvider.js";
import utils from "../utils.js";
import Canvas from "./Canvas.js";

const Utils = new utils();

const Carousel = ({ files, imageDimensions }) => {
    const { setFiles } = useContext(GeneralContext);

    const imagePosRef = useRef({ x: 0, y: 0 });
    const mousePosRef = useRef({ x: 0, y: 0 });
    const imageUnderMouseRef = useRef(null);
    const animateRef = useRef(false);
    const onLeftBtnRef = useRef(false);
    const onRightBtnRef = useRef(false);
    const scrollingLeftRef = useRef(false);
    const scrollingRightRef = useRef(false);
    const chosenImageIndexRef = useRef(null);
    const indexOfFirstRef = useRef(0);
    const numberOfImagesVisibleRef = useRef(0);
    const selectedFilesRef = useRef();
    const clonedElementRef = useRef();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [chosen, setChosen] = useState({ element: null, offsetX: null, offsetY: null, left: null, top: null });

    const onMouseDown = (e, index) => {
        if (e.target.tagName !== "BUTTON") {
            let chosenImage = e.target.getBoundingClientRect();
            let left = e.touches ? chosenImage.left : e.clientX - e.nativeEvent.offsetX;
            let top = e.touches ? chosenImage.top + window.scrollY : e.clientY - e.nativeEvent.offsetY + window.scrollY;

            let offsetX = e.touches ? e.touches[0].pageX - e.touches[0].target.offsetLeft : chosenImage.left + e.nativeEvent.offsetX;
            let offsetY = e.touches ? e.touches[0].pageY - e.touches[0].target.offsetTop : chosenImage.top + e.nativeEvent.offsetY;

            chosenImageIndexRef.current = index;

            setChosen(() => {
                return { element: e.target, offsetX: offsetX, offsetY: offsetY, left: left, top: top };
            });
        }
    };

    const moveClone = () => {
        if (!clonedElementRef.current) {
            animateRef.current = false;
            return;
        }

        if (isMobile) {
            let swapWith = document.elementsFromPoint(mousePosRef.current.x, mousePosRef.current.y)[3]?.parentNode;
            if (swapWith) imageUnderMouseRef.current = swapWith;
        } else {
            let swapWith = document.elementsFromPoint(mousePosRef.current.x, mousePosRef.current.y)[1]?.parentNode;
            if (swapWith) imageUnderMouseRef.current = swapWith;
        }

        clonedElementRef.current.style.transform = `translate(${imagePosRef.current.x}px, ${imagePosRef.current.y}px)`;
        let element = document.getElementById(chosenImageIndexRef.current);

        if (Number.isInteger(parseInt(imageUnderMouseRef.current.id)) && parseInt(imageUnderMouseRef.current.id) !== parseInt(element.id)) {
            let pos1 = 10;
            imageUnderMouseRef.current.style.transform = `translateX(${pos1 += 145 * (parseInt(element.id))}px)`;
            let pos2 = 10;
            element.style.transform = `translateX(${pos2 += 145 * parseInt(imageUnderMouseRef.current.id)}px)`;
            let id = element.id;
            element.id = imageUnderMouseRef.current.id;
            chosenImageIndexRef.current = imageUnderMouseRef.current.id;
            imageUnderMouseRef.current.id = id;
        }

        requestAnimationFrame(moveClone);
    };

    const onMouseMove = useCallback((e) => {
        const helper = () => {
            if (clonedElementRef.current) {
                e.preventDefault();
                let target = e.target;

                if (e.touches) {
                    target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                    mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                } else {
                    mousePosRef.current = { x: e.clientX, y: e.clientY };
                }

                imagePosRef.current = {
                    x: mousePosRef.current.x - chosen.offsetX,
                    y: mousePosRef.current.y - chosen.offsetY + window.scrollY
                };

                let pos1 = 10;
                clonedElementRef.current.style.transform = `translate(${pos1 += 145 * chosenImageIndexRef.current}px)`;

                if (target.tagName !== "BUTTON") {
                    if (target.closest("#left_btn")) {
                        onLeftBtnRef.current = true;
                    } else if (target.closest("#right_btn")) {
                        onRightBtnRef.current = true;
                    } else {
                        onLeftBtnRef.current = false;
                        onRightBtnRef.current = false;
                    }
                }
            }
        };
        requestAnimationFrame(helper);
    }, [chosen]);

    const onMouseUp = (e) => {
        e.preventDefault();
        window.scrollTo(0, 0);

        if (!clonedElementRef.current) {
            return;
        }

        let offset = -135;

        for (let child of selectedFilesRef.current.children) {
            offset += 145;
            child.style.transform = `translateX(${offset}px)`;
            child.id = parseInt(clonedElementRef.current.id) - (145 / 145);
        }

        clonedElementRef.current.remove();
        chosenImageIndexRef.current = null;
        imageUnderMouseRef.current = null;
        clonedElementRef.current = null;
        setChosen({ element: null, offsetX: null, offsetY: null, left: null, top: null });
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", onMouseMove);
        window.removeEventListener("touchend", onMouseUp);
    };

    const scrollLeft = useCallback(() => {
        if (!scrollingLeftRef.current) {
            scrollingLeftRef.current = true;
            const scrollLeftRecursive = () => {
                if (onLeftBtnRef.current) {
                    selectedFilesRef.current.scrollBy({ left: -2, behavior: "auto" });
                    requestAnimationFrame(scrollLeftRecursive);
                } else {
                    scrollingLeftRef.current = false;
                }
            };
            scrollLeftRecursive();
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (!scrollingRightRef.current) {
            scrollingRightRef.current = true;
            const scrollRightRecursive = () => {
                if (onRightBtnRef.current) {
                    selectedFilesRef.current.scrollBy({ left: 2, behavior: "auto" });
                    requestAnimationFrame(scrollRightRecursive);
                } else {
                    scrollingRightRef.current = false;
                }
            };
            scrollRightRecursive();
        }
    }, []);

    const removeFile = (e, index) => {
        e.preventDefault();
        let filesArray = [...files];
        filesArray.splice(index, 1);
        setFiles(filesArray);
    };

    const renderImages = (files) => {
        if (files.length > 0) {
            let offset = -135;
            return files.map((file, index) => {
                // Ensure file has name property
                if (!file.name) {
                    file.name = file.file.name;
                }
                offset += 145;
                return (
                    <div className="image_container" key={file.name + index} id={index}
                        onMouseDown={!isMobile ? (e) => onMouseDown(e, index) : () => { }}
                        onTouchStart={isMobile ? (e) => onMouseDown(e, index) : () => { }}
                        style={{ transform: `translateX(${offset}px)` }}
                    >
                        <div className="image_box">
                            <span className="file_name">{Utils.shortenFileName(file.name)}</span>
                            <button className="remove" onClick={(e) => removeFile(e, index)}>X</button>
                        </div>
                        <Canvas file={file.file}></Canvas>
                    </div>
                );
            });
        } else {
            indexOfFirstRef.current = 0;
            numberOfImagesVisibleRef.current = 0;
            return <p className="no_files">No images uploaded</p>;
        }
    };

    const renderClone = (chosen) => {
        if (chosen.element) {
            if (!clonedElementRef.current) {
                let clone = chosen.element.cloneNode(true);
                clone.id = chosenImageIndexRef.current;
                clone.classList.add("cloned");
                clone.style.width = `${chosen.element.width}px`;
                clone.style.height = `${chosen.element.height}px`;
                clonedElementRef.current = clone;
                document.body.append(clone);
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
                window.addEventListener("touchmove", onMouseMove);
                window.addEventListener("touchend", onMouseUp);
            }
            if (!animateRef.current) {
                animateRef.current = true;
                moveClone();
            }
        }
    };

    return (
        <>
            {renderClone(chosen)}
            <div className="selected_files_container">
                <button id="left_btn" onClick={scrollLeft}> {"<"} </button>
                <div className="selected_files" ref={selectedFilesRef}>{renderImages(files)}</div>
                <button id="right_btn" onClick={scrollRight}>{">"}</button>
            </div>
        </>
    );
};

export default Carousel;

