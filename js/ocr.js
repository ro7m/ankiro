const performOCR = async (imageData) => {
    const result = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(m)
    });
    
    // Extract text and bounding boxes separately
    const extractedText = result.data.words.map(word => word.text).join(' ');
    const boundingBoxes = result.data.words.map(word => ({
        word: word.text,
        boundingBox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1
        }
    }));

    return { text: extractedText, boundingBoxes: boundingBoxes };
};
