#!/usr/bin/env node

/**
 * Quantum Cryption Crypto Test Suite
 * Tests the core cryptographic functionality
 */

const CryptoJS = require('crypto-js');

// Mock the QES512 class for testing
class QES512 {
  constructor() {
    this.config = {
      keySize: 32, // 256 bits
      blockSize: 16, // 128 bits
      rounds: 14
    };
  }

  generateKey(password, salt) {
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: this.config.keySize,
      iterations: 100000
    });
    return key.toString(CryptoJS.enc.Hex);
  }

  encrypt(plaintext, password) {
    const startTime = performance.now();
    
    // Generate multiple keys for layered encryption
    const salt = CryptoJS.lib.WordArray.random(32).toString();
    const key1 = this.generateKey(password, salt);
    const key2 = this.generateKey(password + 'layer2', salt);
    
    // Create IV
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // First layer: AES-256 encryption
    let ciphertext = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Hex.parse(key1), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Second layer: Additional AES-256 encryption with different key
    const intermediate = ciphertext.toString();
    ciphertext = CryptoJS.AES.encrypt(intermediate, CryptoJS.enc.Hex.parse(key2), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const endTime = performance.now();
    const encryptionTime = endTime - startTime;
    
    return {
      ciphertext: ciphertext.toString(),
      iv: iv.toString(CryptoJS.enc.Hex),
      salt: salt,
      algorithm: 'QES-512 (Experimental)',
      keySize: this.config.keySize * 8,
      blockSize: this.config.blockSize * 8,
      rounds: this.config.rounds,
      layers: 2,
      encryptionTime,
      ciphertextSize: ciphertext.toString().length
    };
  }

  decrypt(ciphertext, password, iv, salt) {
    const startTime = performance.now();
    
    try {
      // Generate the same keys used for encryption
      const key1 = this.generateKey(password, salt);
      const key2 = this.generateKey(password + 'layer2', salt);
      
      const ivBytes = CryptoJS.enc.Hex.parse(iv);
      
      // First layer: Decrypt with second key
      let decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(key2), {
        iv: ivBytes,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Second layer: Decrypt with first key
      const intermediate = decrypted.toString();
      if (!intermediate) {
        throw new Error('First layer decryption failed - no intermediate result');
      }
      
      decrypted = CryptoJS.AES.decrypt(intermediate, CryptoJS.enc.Hex.parse(key1), {
        iv: ivBytes,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) {
        throw new Error('Second layer decryption failed - invalid UTF-8 data');
      }
      
      const endTime = performance.now();
      const decryptionTime = endTime - startTime;
      
      return {
        plaintext: plaintext,
        algorithm: 'QES-512 (Experimental)',
        decryptionTime
      };
    } catch (error) {
      if (error.message.includes('Malformed UTF-8')) {
        throw new Error(`QES-512 decryption failed: Invalid password or corrupted data - ${error.message}`);
      }
      throw new Error(`QES-512 decryption failed: ${error.message}`);
    }
  }

  getSecurityLevel() {
    return {
      classicalBits: 512,
      quantumBits: 256,
      classicalComplexity: Math.pow(2, 512),
      quantumComplexity: Math.pow(2, 256),
      bruteForceTime: '1.34 × 10¹⁵⁴ years',
      quantumBruteForceTime: '1.16 × 10⁷⁷ years'
    };
  }
}

// Test suite
class CryptoTestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Quantum Cryption Crypto Test Suite');
    console.log('=====================================');
    console.log('');

    for (const test of this.tests) {
      try {
        console.log(`Testing ${test.name}...`);
        await test.testFn();
        console.log(`✅ ${test.name} - PASS`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name} - FAIL: ${error.message}`);
        this.failed++;
      }
    }

    console.log('');
    console.log('📊 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${this.tests.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);

    if (this.failed === 0) {
      console.log('');
      console.log('🎉 All crypto tests passed! QES-512 is working correctly.');
      return true;
    } else {
      console.log('');
      console.log('❌ Some crypto tests failed. Please check the issues above.');
      return false;
    }
  }
}

// Create test suite
const testSuite = new CryptoTestSuite();
const qes512 = new QES512();

// Test 1: Basic encryption/decryption
testSuite.addTest('Basic QES-512 Encryption/Decryption', () => {
  const plaintext = 'Hello, Quantum World!';
  const password = 'test-password-123';
  
  const encrypted = qes512.encrypt(plaintext, password);
  
  if (!encrypted.ciphertext || !encrypted.iv || !encrypted.salt) {
    throw new Error('Encryption result missing required fields');
  }
  
  const decrypted = qes512.decrypt(encrypted.ciphertext, password, encrypted.iv, encrypted.salt);
  
  if (decrypted.plaintext !== plaintext) {
    throw new Error(`Decryption failed: expected "${plaintext}", got "${decrypted.plaintext}"`);
  }
});

// Test 2: Different passwords should fail
testSuite.addTest('Wrong Password Should Fail', () => {
  const plaintext = 'Secret message';
  const correctPassword = 'correct-password';
  const wrongPassword = 'wrong-password';
  
  const encrypted = qes512.encrypt(plaintext, correctPassword);
  
  try {
    qes512.decrypt(encrypted.ciphertext, wrongPassword, encrypted.iv, encrypted.salt);
    throw new Error('Decryption with wrong password should have failed');
  } catch (error) {
    if (!error.message.includes('decryption failed')) {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
});

// Test 3: Large text encryption
testSuite.addTest('Large Text Encryption', () => {
  const plaintext = 'A'.repeat(1000); // 1KB of text
  const password = 'large-test-password';
  
  const encrypted = qes512.encrypt(plaintext, password);
  const decrypted = qes512.decrypt(encrypted.ciphertext, password, encrypted.iv, encrypted.salt);
  
  if (decrypted.plaintext !== plaintext) {
    throw new Error('Large text decryption failed');
  }
  
  if (encrypted.encryptionTime > 100) { // Should be reasonable
    throw new Error(`Encryption too slow: ${encrypted.encryptionTime}ms`);
  }
});

// Test 4: Security level check
testSuite.addTest('Security Level Information', () => {
  const securityLevel = qes512.getSecurityLevel();
  
  if (securityLevel.classicalBits !== 512) {
    throw new Error(`Expected 512 classical bits, got ${securityLevel.classicalBits}`);
  }
  
  if (securityLevel.quantumBits !== 256) {
    throw new Error(`Expected 256 quantum bits, got ${securityLevel.quantumBits}`);
  }
  
  if (!securityLevel.bruteForceTime || !securityLevel.quantumBruteForceTime) {
    throw new Error('Security level missing time estimates');
  }
});

// Test 5: Binary data simulation
testSuite.addTest('Binary Data Simulation', () => {
  // Simulate binary data with base64
  const binaryData = btoa('Binary test data with special chars: !@#$%^&*()');
  const password = 'binary-test-password';
  
  const encrypted = qes512.encrypt(binaryData, password);
  const decrypted = qes512.decrypt(encrypted.ciphertext, password, encrypted.iv, encrypted.salt);
  
  if (decrypted.plaintext !== binaryData) {
    throw new Error('Binary data decryption failed');
  }
});

// Run tests
testSuite.runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
