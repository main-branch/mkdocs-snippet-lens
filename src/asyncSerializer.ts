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
  private _isExecuting = false;
  private _pendingFn: (() => Promise<void>) | undefined = undefined;

  /**
   * Execute an async operation, ensuring it doesn't overlap with previous calls.
   *
   * If an execution is already in progress, this call stores {@link fn} as the next
   * operation to run and returns immediately. When the current execution finishes, the
   * most recently stored pending function will be executed. Multiple calls during
   * execution are coalesced — only the last-queued function runs for the coalesced
   * re-execution.
   *
   * @param fn The async operation to execute
   * @returns A promise that resolves when this call has been acknowledged
   *          (either executed immediately or queued for a coalesced re-run). Awaiting
   *          this promise does not guarantee a distinct execution of {@link fn} for
   *          this call; coalesced calls share execution cycles.
   */
  async execute(fn: () => Promise<void>): Promise<void> {
    // If already executing, store latest fn for the coalesced re-run and return immediately
    if (this._isExecuting) {
      this._pendingFn = fn;
      return;
    }

    this._isExecuting = true;
    let firstError: unknown | undefined;
    try {
      // Keep executing while new requests come in, always using the latest queued fn
      let nextFn: (() => Promise<void>) | undefined = fn;
      while (nextFn !== undefined) {
        const toRun = nextFn;
        this._pendingFn = undefined;
        try {
          await toRun();
        } catch (error) {
          // Record the first error but continue processing pending executions
          if (firstError === undefined) {
            firstError = error;
          }
        }
        nextFn = this._pendingFn;
      }
    } finally {
      this._isExecuting = false;
      this._pendingFn = undefined;
    }

    if (firstError !== undefined) {
      throw firstError;
    }
  }
}
