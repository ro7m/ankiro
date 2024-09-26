const performOCR = async (imageData) => {
    const result = await Tesseract.recognize(imageData,'eng', {
        logger: m => console.log(m)
    });
    return result.data.text;
};
