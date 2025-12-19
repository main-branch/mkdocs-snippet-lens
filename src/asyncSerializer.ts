/**
 * AsyncSerializer ensures that async operations are executed serially,
 * preventing race conditions when the same operation is triggered multiple times rapidly.
 *
 * When an operation is already in progress, subsequent calls are coalesced - the operation
 * will run again after the current execution completes, but only once regardless of how many
 * times execute() was called during that time.
 *
 * Example usage:
 * ```typescript
 * const serializer = new AsyncSerializer();
 *
 * // These rapid calls won't overlap - first runs immediately,
 * // subsequent calls are coalesced into one re-execution
 * await serializer.execute(async () => {
 *   await loadConfig();
 *   refreshUI();
 * });
 * ```
 */
export class AsyncSerializer {
  private isExecuting = false;
  private hasPending = false;

  /**
   * Execute an async operation, ensuring it doesn't overlap with previous calls.
   *
   * If an execution is already in progress, this call marks that another execution
   * is needed and returns immediately. The operation will run again after the current
   * execution completes.
   *
   * Multiple calls during execution are coalesced - the operation runs at most once
   * more after the current execution, regardless of how many times execute() was called.
   *
   * @param fn The async operation to execute
   * @returns A promise that resolves when this execution request has been handled
   *          (may resolve immediately if another execution is in progress)
   */
  async execute(fn: () => Promise<void>): Promise<void> {
    // If already executing, mark that we need another run and return immediately
    if (this.isExecuting) {
      this.hasPending = true;
      return;
    }

    this.isExecuting = true;
    try {
      // Keep executing while new requests come in
      do {
        // Clear pending flag before starting - new calls during this execution will set it again
        this.hasPending = false;
        await fn();
      } while (this.hasPending);
    } finally {
      this.isExecuting = false;
    }
  }
}
