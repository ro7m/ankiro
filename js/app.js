const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const ocrResult = document.getElementById('ocr-result');
const sendButton = document.getElementById('sendText');

// Get camera stream
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error('Error accessing the camera: ', err);
    });

// Capture photo
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    extractTextFromImage(image).then((text) => {
        ocrResult.innerHTML = text;
    });
});

// Send text to a mock API (e.g., JSONPlaceholder)
sendButton.addEventListener('click', () => {
    const extractedText = ocrResult.innerHTML;
    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: extractedText }),
    })
    .then((response) => response.json())
    .then((json) => console.log('API Response:', json))
    .catch((err) => console.error('Error sending to API:', err));
});
