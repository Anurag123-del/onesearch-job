// Using @xenova/transformers in a web worker
import { pipeline, env } from '@xenova/transformers';

// Configuration for the worker environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1; // Use a single thread for background processing

// Singleton class to ensure the model is loaded only once
class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance(progress_callback) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.onmessage = async (event) => {
  // The first message will be the text to process.
  // Any subsequent messages will be ignored.
  const text = event.data;
  if (!text) return;

  try {
    const extractor = await EmbeddingPipeline.getInstance(progress => {
      // Send progress updates back to the main thread
      self.postMessage(progress);
    });

    // Generate the embedding
    const result = await extractor(text, { pooling: 'mean', normalize: true });

    // Send the completed embedding back to the main thread
    self.postMessage({
      status: 'complete',
      output: Array.from(result.data),
    });

  } catch (e) {
    // Send any errors back to the main thread
    self.postMessage({
      status: 'error',
      error: e,
    });
  }
};

// Send a "ready" message to the main thread once the worker is initialized
self.postMessage({
  status: 'ready',
});
