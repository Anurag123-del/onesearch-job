class EmbeddingWorkerManager {
  static worker: Worker | null = null;
  static ready = false;
  static queue: { text: string; resolve: (value: number[]) => void; reject: (reason?: Error) => void }[] = [];

  static getInstance() {
    if (!this.worker) {
      this.worker = new Worker('/workers/embedding.worker.js', {
        type: 'module',
      });

      this.worker.onmessage = (event) => {
        console.log('Worker message:', event.data);
        const { status, output, error } = event.data;
        if (status === 'ready') {
          this.ready = true;
          this.processQueue();
        } else if (status === 'complete') {
          const item = this.queue.shift();
          if (item) {
            item.resolve(output);
            this.processQueue();
          }
        } else if (status === 'error') {
          const item = this.queue.shift();
          if (item) {
            item.reject(error);
            this.processQueue();
          }
        }
      };
    }
    return this;
  }

  static processQueue() {
    if (this.ready && this.queue.length > 0) {
      const item = this.queue[0];
      this.worker?.postMessage(item.text);
    }
  }

  static embedText(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, resolve, reject });
      if (this.ready) {
        this.processQueue();
      }
    });
  }
}

export const embedText = (text: string): Promise<number[]> => {
  const manager = EmbeddingWorkerManager.getInstance();
  return manager.embedText(text);
};
