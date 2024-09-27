// Load TensorFlow.js and the model

const VOCAB =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~°£€¥¢฿àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ"

// Function to load and predict with the TensorFlow model
async function loadModel() {
  // Load the model (path can be a URL or local path for Node.js)
  const model = await tf.loadGraphModel('models/crnn_mobilenet_v2/model.json'); 

  return model;
}

async function preprocessImage(imageData) {
  let image = tf.browser.fromPixels(imageData);
  const resizedImage = tf.image.resizeBilinear(image, [128, 32]); // Resize to model input size
  const normalizedImage = resizedImage.div(255.0); // Normalize
  return normalizedImage.expandDims(0); // Add batch dimension
}
async function processPredictions(predictions) {
  let probabilities = softmax(predictions, -1);
  let bestPath = unstack(argMax(probabilities, -1), 0);
  let blank = 126;
  var words = [];
  for (const sequence of bestPath) {
    let collapsed = "";
    let added = false;
    const values = sequence.dataSync();
    const arr = Array.from(values);
    for (const k of arr) {
      if (k === blank) {
        added = false;
      } else if (k !== blank && added === false) {
        collapsed += VOCAB[k];
        added = true;
      }
    }
    words.push(collapsed);
  }
  return words;
}



const performOCR = async (imageData) => {

  const model = await loadModel();
  const preprocessedImage = await preprocessImage(imageData);
  const predictions = model.predict(preprocessedImage);
  const output = await processPredictions(predictions);
  return output;
};
