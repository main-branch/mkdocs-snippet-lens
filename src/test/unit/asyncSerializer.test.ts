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
    let inFlight = 0;
    let maxInFlight = 0;

    // A manually controlled barrier holds the operation in-flight until released,
    // making this test deterministic and free of real-time delays.
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });

    const operation = async () => {
      inFlight++;
      if (inFlight > maxInFlight) { maxInFlight = inFlight; }
      await barrier;
      inFlight--;
    };

    // Fire three operations; first executes immediately, the rest are coalesced
    const promises = [
      serializer.execute(operation),
      serializer.execute(operation),
      serializer.execute(operation),
    ];

    // Release the barrier so all executions can complete
    release();
    await Promise.all(promises);

    assert.strictEqual(maxInFlight, 1, 'At most one execution should be in flight at a time');
  });

  it('should coalesce multiple pending calls into a single additional execution', async () => {
    const serializer = new AsyncSerializer();
    let executionCount = 0;

    // A manually controlled barrier holds the first execution in-flight while
    // the remaining calls are dispatched synchronously, ensuring coalescing occurs.
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });

    const countingOperation = async () => {
      executionCount++;
      await barrier;
    };

    // Fire five operations rapidly while first is running
    const promises = [
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
      serializer.execute(countingOperation),
    ];

    release();
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

    // A manually controlled barrier holds the first execution in-flight so calls
    // B and C are coalesced before A finishes (and throws).
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });

    const operation = async () => {
      const id = ++executionCount;
      await barrier;
      if (id === 1) {
        throw new Error('First execution failed');
      }
    };

    // Start call A (will error after barrier), then dispatch B and C which get coalesced
    const promiseA = serializer.execute(operation);
    const promiseB = serializer.execute(operation);
    const promiseC = serializer.execute(operation);

    release();

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
      await Promise.resolve();
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
