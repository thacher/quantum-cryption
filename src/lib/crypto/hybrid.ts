/**
 * Hybrid Encryption Demo - Multiple AES-256 rounds to simulate "AES-512 strength"
 * This demonstrates the concept of layered encryption for enhanced security
 */

import { AES256 } from './aes256';

export interface HybridEncryptionResult {
  ciphertext: string;
  iv: string;
  algorithm: string;
  layers: number;
  totalKeySize: number;
  blockSize: number;
  encryptionTime: number;
  ciphertextSize: number;
  throughput: number; // bytes per second
}

export interface HybridDecryptionResult {
  plaintext: string;
  algorithm: string;
  decryptionTime: number;
  throughput: number; // bytes per second
}

export class HybridEncryption {
  private aes256: AES256;
  private layers: number;

  constructor(layers: number = 2) {
    this.aes256 = new AES256();
    this.layers = layers;
  }

  /**
   * Encrypt data using multiple layers of AES-256
   */
  encrypt(plaintext: string, password: string): HybridEncryptionResult {
    const startTime = performance.now();
    const originalSize = new TextEncoder().encode(plaintext).length;
    
    let currentData = plaintext;
    const ivs: string[] = [];
    
    // Apply multiple layers of encryption
    for (let i = 0; i < this.layers; i++) {
      const layerPassword = `${password}_layer_${i}`;
      const result = this.aes256.encrypt(currentData, layerPassword);
      currentData = result.ciphertext;
      ivs.push(result.iv);
    }
    
    const endTime = performance.now();
    const encryptionTime = endTime - startTime;
    const throughput = originalSize / (encryptionTime / 1000); // bytes per second
    
    return {
      ciphertext: currentData,
      iv: ivs.join('|'), // Store all IVs separated by |
      algorithm: `Hybrid AES-256 (${this.layers} layers)`,
      layers: this.layers,
      totalKeySize: 256 * this.layers, // Total effective key size
      blockSize: 128,
      encryptionTime,
      ciphertextSize: currentData.length,
      throughput
    };
  }

  /**
   * Decrypt data using multiple layers of AES-256
   */
  decrypt(ciphertext: string, password: string, ivs: string): HybridDecryptionResult {
    const startTime = performance.now();
    const originalSize = ciphertext.length;
    
    let currentData = ciphertext;
    const ivArray = ivs.split('|');
    
    // Apply multiple layers of decryption in reverse order
    for (let i = this.layers - 1; i >= 0; i--) {
      const layerPassword = `${password}_layer_${i}`;
      const result = this.aes256.decrypt(currentData, layerPassword, ivArray[i]);
      currentData = result.plaintext;
    }
    
    const endTime = performance.now();
    const decryptionTime = endTime - startTime;
    const throughput = originalSize / (decryptionTime / 1000); // bytes per second
    
    return {
      plaintext: currentData,
      algorithm: `Hybrid AES-256 (${this.layers} layers)`,
      decryptionTime,
      throughput
    };
  }

  /**
   * Get algorithm information
   */
  getInfo() {
    return {
      name: `Hybrid AES-256 (${this.layers} layers)`,
      layers: this.layers,
      totalKeySize: 256 * this.layers,
      blockSize: 128,
      status: 'Experimental',
      description: `Multiple layers of AES-256 encryption for enhanced security`
    };
  }

  /**
   * Calculate theoretical security level
   */
  getSecurityLevel() {
    const effectiveBits = 256 * this.layers;
    return {
      classicalBits: effectiveBits,
      quantumBits: effectiveBits / 2, // Grover's algorithm reduces by half
      classicalComplexity: Math.pow(2, effectiveBits),
      quantumComplexity: Math.pow(2, effectiveBits / 2),
      bruteForceTime: this.calculateBruteForceTime(effectiveBits),
      quantumBruteForceTime: this.calculateBruteForceTime(effectiveBits / 2),
      layers: this.layers,
      performanceImpact: this.layers * 2 // Rough estimate of performance impact
    };
  }

  private calculateBruteForceTime(bits: number): string {
    // Assuming 1 billion keys per second
    const keysPerSecond = 1e9;
    const totalKeys = Math.pow(2, bits);
    const seconds = totalKeys / keysPerSecond;
    
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(2)} years`;
    return `${(seconds / 31536000000).toFixed(2)} billion years`;
  }

  /**
   * Set number of encryption layers
   */
  setLayers(layers: number) {
    this.layers = layers;
  }

  /**
   * Get current number of layers
   */
  getLayers(): number {
    return this.layers;
  }
}
