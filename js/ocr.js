async function extractTextFromImage(image) {
    const result = await Tesseract.recognize(image, 'eng');
    return result.data.text;  // Extracted text
}
