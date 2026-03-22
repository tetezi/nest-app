import { Readable } from 'stream';

export function createSseReadable() {
  const sseStream = new Readable({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    read() {},
  });
  let isStreamEnded = false;
  const dataList: unknown[] = [];
  async function pushSseData(content?: unknown) {
    if (isStreamEnded) {
      return false;
    }

    const isPushSuccess = sseStream.push(
      `data: ${JSON.stringify(content)}\n\n`,
    );
    dataList.push(content);
    if (!isPushSuccess) {
      await new Promise((resolve) => {
        sseStream.once('drain', resolve);
      });
    }
  }
  function endStream() {
    if (isStreamEnded) {
      return false;
    }
    isStreamEnded = true;
    sseStream.push('data: [DONE]\n\n');
    sseStream.push(null);
    sseStream.destroy();
  }
  sseStream.on('end', () => {
    isStreamEnded = true;
  });
  return { sseStream, pushSseData, endStream, dataList };
}
