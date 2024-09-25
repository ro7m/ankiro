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

let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', (e) => {
    // Hide our user interface that shows our A2HS button
    installBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
    });
});

// Hide the install button when the app is already installed
window.addEventListener('appinstalled', (evt) => {
    installBtn.style.display = 'none';
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
