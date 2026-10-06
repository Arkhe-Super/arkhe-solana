import { detectBackend, initWebGPU } from './backend';
import blake3WGSL from './shaders/blake3.wgsl?raw';
import { hash as blake3WasmHash } from 'blake3-wasm-rs';

export async function computeHash(data: Uint8Array): Promise<{ hash: Uint8Array; timeMs: number; backend: string }> {
  const backend = await detectBackend();
  const start = performance.now();

  let hash: Uint8Array;

  if (backend === 'webgpu') {
    try {
      hash = await computeHashWebGPU(data);
    } catch (e) {
      console.warn("WebGPU hashing failed, falling back to WASM", e);
      hash = await computeHashWasm(data);
    }
  } else if (backend === 'wasm') {
    hash = await computeHashWasm(data);
  } else {
    // JS Fallback (Mock for now, would use noble-hashes in reality)
    hash = new Uint8Array(32); // Mock 32-byte hash
  }

  const end = performance.now();

  return {
    hash,
    timeMs: end - start,
    backend
  };
}

async function computeHashWasm(data: Uint8Array): Promise<Uint8Array> {
  // Use blake3-wasm-rs
  return blake3WasmHash(data);
}

async function computeHashWebGPU(data: Uint8Array): Promise<Uint8Array> {
  const gpu = await initWebGPU();
  if (!gpu) throw new Error("WebGPU not available");

  const { device } = gpu;

  // Create shader module
  const shaderModule = device.createShaderModule({
    code: blake3WGSL
  });

  // Pad data to multiple of 4 for u32 array
  const paddedLength = Math.ceil(data.length / 4) * 4;
  const dataU32 = new Uint32Array(paddedLength / 4);
  const dataU8 = new Uint8Array(dataU32.buffer);
  dataU8.set(data);

  // Number of 64-byte blocks to process (simplified)
  const numBlocks = Math.max(1, Math.ceil(data.length / 64));

  // Create buffers
  const inputBuffer = device.createBuffer({
    size: dataU32.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const outputBuffer = device.createBuffer({
    size: numBlocks * 32, // 32 bytes per hash output
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const stagingBuffer = device.createBuffer({
    size: numBlocks * 32,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(inputBuffer, 0, dataU32);

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" }
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" }
      }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: outputBuffer } }
    ]
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout]
  });

  const computePipeline = device.createComputePipeline({
    layout: pipelineLayout,
    compute: {
      module: shaderModule,
      entryPoint: "main"
    }
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);

  // Dispatch workgroups
  const workgroupCount = Math.ceil(numBlocks / 64);
  passEncoder.dispatchWorkgroups(workgroupCount);
  passEncoder.end();

  commandEncoder.copyBufferToBuffer(outputBuffer, 0, stagingBuffer, 0, stagingBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await stagingBuffer.mapAsync(GPUMapMode.READ);
  const resultBuffer = stagingBuffer.getMappedRange();

  // We only return the hash of the first block for this POC,
  // in reality this would involve a Merkle tree of block hashes or sequential chaining.
  const result = new Uint8Array(resultBuffer.slice(0, 32));

  stagingBuffer.unmap();

  return result;
}
