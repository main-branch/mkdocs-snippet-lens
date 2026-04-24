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
   * @returns A promise whose meaning depends on whether this call starts a new
   *          execution cycle. If no execution is in progress, the promise resolves
   *          after the current execution cycle completes, including any coalesced
   *          re-execution triggered while it is running, and rejects if the final
   *          execution of that cycle fails. If an execution is already in progress,
   *          the promise resolves once this call has been acknowledged and {@link fn}
   *          has been stored as the latest pending operation; in that case, the
   *          returned promise does not observe the eventual success or failure of the
   *          running/coalesced execution and does not guarantee a distinct execution
   *          of {@link fn}.
   */
  async execute(fn: () => Promise<void>): Promise<void> {
    // If already executing, store latest fn for the coalesced re-run and return immediately
    if (this._isExecuting) {
      this._pendingFn = fn;
      return;
    }

    this._isExecuting = true;
    let lastError: unknown | undefined;
    try {
      // Keep executing while new requests come in, always using the latest queued fn
      let nextFn: (() => Promise<void>) | undefined = fn;
      while (nextFn !== undefined) {
        const toRun = nextFn;
        this._pendingFn = undefined;
        try {
          await toRun();
          lastError = undefined; // Clear error if a subsequent execution succeeds
        } catch (error) {
          lastError = error;
        }
        nextFn = this._pendingFn;
      }
    } finally {
      this._isExecuting = false;
      this._pendingFn = undefined;
    }

    if (lastError !== undefined) {
      throw lastError;
    }
  }
}
