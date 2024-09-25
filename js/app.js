const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const extractBtn = document.getElementById('extract-btn');
const submitBtn = document.getElementById('submit-btn');
const extractedText = document.getElementById('extracted-text');
const apiResponse = document.getElementById('api-response');

let imageData = null;

// Access the camera
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
}

setupCamera();

// Capture image from video
captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    imageData = canvas.toDataURL('image/jpeg');
    extractBtn.disabled = false;
});

// Perform OCR on captured image
extractBtn.addEventListener('click', async () => {
    if (!imageData) return;

    extractBtn.disabled = true;
    submitBtn.disabled = true;
    extractedText.textContent = 'Processing...';

    try {
        const text = await performOCR(imageData);
        extractedText.textContent = text;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Error during OCR:', error);
        extractedText.textContent = 'Error occurred during text extraction.';
    } finally {
        extractBtn.disabled = false;
    }
});

// Submit extracted text to API
submitBtn.addEventListener('click', async () => {
    const text = extractedText.textContent;
    if (!text) return;

    submitBtn.disabled = true;
    apiResponse.textContent = 'Submitting...';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Extracted Text',
                body: text,
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        apiResponse.textContent = `API Response: ${JSON.stringify(data, null, 2)}`;
    } catch (error) {
        console.error('Error submitting to API:', error);
        apiResponse.textContent = 'Error occurred while submitting to API.';
    } finally {
        submitBtn.disabled = false;
    }
});
