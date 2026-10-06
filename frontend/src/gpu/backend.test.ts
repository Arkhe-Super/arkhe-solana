import { describe, it, expect, vi } from 'vitest';
import { detectBackend } from './backend';

describe('detectBackend', () => {
  it('detects webgpu if navigator.gpu exists and requestAdapter resolves', async () => {
    // Mock navigator.gpu
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        gpu: {
          requestAdapter: vi.fn().mockResolvedValue({})
        }
      },
      writable: true
    });

    const backend = await detectBackend();
    expect(backend).toBe('webgpu');
  });

  it('detects wasm if webgpu fails but WebAssembly exists', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { gpu: undefined },
      writable: true
    });

    // We run in Node which has WebAssembly
    const backend = await detectBackend();
    expect(backend).toBe('wasm');
  });
});
