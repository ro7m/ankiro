const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureExtractBtn = document.getElementById('capture-extract-btn');
const submitBtn = document.getElementById('submit-btn');
const extractedText = document.getElementById('extracted-text');
const apiResponse = document.getElementById('api-response');

// Access the camera
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
}

setupCamera();

// Capture image from video and perform OCR
captureExtractBtn.addEventListener('click', async () => {
    captureExtractBtn.disabled = true;
    submitBtn.disabled = true;
    extractedText.textContent = 'Processing...';

    try {
        // Capture image
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');

        // Perform OCR
        const text = await performOCR(imageData);
        extractedText.textContent = text;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Error during capture and OCR:', error);
        extractedText.textContent = 'Error occurred during text extraction.';
    } finally {
        captureExtractBtn.disabled = false;
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

// PWA install logic
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', (e) => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed.');
    installBtn.style.display = 'none';
});


