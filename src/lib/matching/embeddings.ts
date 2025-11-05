export const embedText = async (text: string, progressCallback?: (progress: Record<string, unknown>) => void): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    // Create a new worker instance
    const worker = new Worker(new URL('./../../public/workers/embedding.worker.js', import.meta.url), {
      type: 'module',
    });

    // Handle messages from the worker
    worker.onmessage = (event) => {
      const { status, output, error, ...progress } = event.data;

      switch (status) {
        case 'ready':
          // The model is ready, we can now send the text
          worker.postMessage(text);
          break;

        case 'update':
          // Pass progress updates to the optional callback
          if (progressCallback) {
            progressCallback(progress);
          }
          break;

        case 'complete':
          // The embedding is complete, resolve the promise
          resolve(output);
          worker.terminate();
          break;

        case 'error':
          // An error occurred, reject the promise
          reject(error);
          worker.terminate();
          break;
      }
    };

    // Handle any errors that occur during worker initialization
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    // Send the text to the worker to start the process
    worker.postMessage(text);
  });
};
