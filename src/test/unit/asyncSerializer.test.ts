import * as assert from 'assert';
import { AsyncSerializer } from '../../asyncSerializer';

/**
 * Unit tests for AsyncSerializer
 *
 * AsyncSerializer ensures that async operations are executed serially,
 * preventing race conditions when the same async operation is triggered
 * multiple times rapidly.
 */
describe('AsyncSerializer', () => {
  it('should prevent concurrent executions', async () => {
    const serializer = new AsyncSerializer();
    const executions: Array<{ id: number; start: number; end: number }> = [];
    let counter = 0;

    const slowOperation = async () => {
      const id = counter++;
      const startTime = Date.now();
      executions.push({ id, start: startTime, end: -1 });

      // Simulate async operation with artificial delay
      await new Promise(resolve => setTimeout(resolve, 50));

      const endTime = Date.now();
      const execution = executions.find(e => e.id === id);
      if (execution) {
        execution.end = endTime;
      }
    };

    // Fire three operations rapidly
    const promises = [
      serializer.execute(slowOperation),
      serializer.execute(slowOperation),
      serializer.execute(slowOperation),
    ];

    await Promise.all(promises);

    // Verify no overlaps occurred
    // Sort by start time to ensure we check in correct order
    const sorted = executions.sort((a, b) => a.start - b.start);

    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(
        sorted[i].end <= sorted[i + 1].start,
        `Execution ${sorted[i].id} (ended at ${sorted[i].end}) overlapped with ` +
        `execution ${sorted[i + 1].id} (started at ${sorted[i + 1].start})`
      );
    }
  });

  it('should coalesce multiple pending calls into single execution', async () => {
    const serializer = new AsyncSerializer();
    let executionCount = 0;

    const countingOperation = async () => {
      executionCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
    };

    // Fire five operations rapidly while first is running
    const promises = [
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
    ];

    await Promise.all(promises);

    // With coalescing of synchronously scheduled calls, this should be deterministic:
    // - First call runs immediately.
    // - Calls 2-5 are all queued while the first is running and are coalesced into
    //   a single additional execution that services all pending callers.
    // Therefore we expect exactly 2 executions.
    assert.strictEqual(
      executionCount,
      2,
      `Expected exactly 2 executions with coalescing, got ${executionCount}`
    );
  });

  it('should execute immediately if not already running', async () => {
    const serializer = new AsyncSerializer();
    let executed = false;

    await serializer.execute(async () => {
      executed = true;
    });

    assert.strictEqual(executed, true, 'Should execute immediately when not busy');
  });

  it('should handle errors without breaking serialization', async () => {
    const serializer = new AsyncSerializer();
    const executions: number[] = [];

    const failingOperation = async () => {
      executions.push(1);
      throw new Error('Operation failed');
    };

    const successOperation = async () => {
      executions.push(2);
    };

    // First operation fails
    await serializer.execute(failingOperation).catch(() => {});

    // Second operation should still run
    await serializer.execute(successOperation);

    assert.deepStrictEqual(executions, [1, 2], 'Should execute both operations despite error');
  });

  it('should execute coalesced pending calls even when an error occurs', async () => {
    const serializer = new AsyncSerializer();
    let executionCount = 0;

    const operation = async () => {
      const id = ++executionCount;
      await new Promise(resolve => setTimeout(resolve, 50));
      if (id === 1) {
        throw new Error('First execution failed');
      }
    };

    // Start call A (will error after delay), then dispatch B and C which get coalesced
    const promiseA = serializer.execute(operation);
    const promiseB = serializer.execute(operation);
    const promiseC = serializer.execute(operation);

    // A rejects; B and C already resolved immediately (coalesced)
    await promiseA.catch(() => {});
    await promiseB;
    await promiseC;

    // The pending coalesced work must still have been executed despite A's error
    assert.strictEqual(
      executionCount,
      2,
      `Expected 2 executions (A + coalesced B/C), got ${executionCount}`
    );
  });

  it('should handle rapid sequential calls after completion', async () => {
    const serializer = new AsyncSerializer();
    const executions: number[] = [];

    const operation = async (id: number) => {
      executions.push(id);
      await new Promise(resolve => setTimeout(resolve, 10));
    };

    // First batch
    await serializer.execute(() => operation(1));
    await serializer.execute(() => operation(2));

    // Second batch after first completes
    await serializer.execute(() => operation(3));
    await serializer.execute(() => operation(4));

    assert.deepStrictEqual(executions, [1, 2, 3, 4], 'Should execute all operations in order');
  });
});
