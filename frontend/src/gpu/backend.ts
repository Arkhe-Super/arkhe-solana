export type BackendType = 'webgpu' | 'wasm' | 'js';

export async function detectBackend(): Promise<BackendType> {
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        return 'webgpu';
      }
    } catch (e) {
      console.warn('WebGPU requestAdapter failed, falling back', e);
    }
  }

  if (typeof WebAssembly === 'object') {
    return 'wasm';
  }

  return 'js';
}

export async function initWebGPU(): Promise<{ device: GPUDevice; adapter: GPUAdapter } | null> {
  if (!navigator.gpu) {
    return null;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return null;
  }

  const device = await adapter.requestDevice();
  return { device, adapter };
}
