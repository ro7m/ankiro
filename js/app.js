const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const ocrResult = document.getElementById('ocr-result');
const sendButton = document.getElementById('sendText');

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default install prompt
  e.preventDefault();
  
  // Save the event for later use
  deferredPrompt = e;

  // Optionally, show your own install button to trigger the prompt
  const installButton = document.querySelector('#installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    // Show the install prompt when the button is clicked
    deferredPrompt.prompt();

    // Wait for the user's choice
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null; // Reset the prompt
    });
  });
});
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
