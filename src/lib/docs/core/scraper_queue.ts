import PQueue from "p-queue";

class ScraperQueue {
  queue: PQueue;
  urlSet: Set<string>;
  processedCount : number;
  total: number;
  processUrl: (url: string) => {};

  constructor(processUrl: (url: string) => {}) {
    this.queue = new PQueue({
      concurrency: 5,
      interval: 1000,
      intervalCap: 5,
    });
    this.urlSet = new Set();
    this.processUrl = processUrl;
    this.processedCount = 0;
    this.total = 0;
  }

  async add(path:string) {
    if (this.urlSet.has(path)) {
      return;
    }

    this.urlSet.add(path);
    this.total += 1;
    await this.queue.add(async () => {
      console.log(`Processing url: ${path} (${this.processedCount+1}/${this.total})`);
      await this.processUrl(path)
      this.processedCount += 1;
    });
  }

  async onIdle() {
    return this.queue.onIdle();
  }
}

export default ScraperQueue;