/**
 * Cryptography Playground - Interactive learning environment
 */

'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Zap,
  Shield,
  Lock,
  Key,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Input, Textarea, Alert, Badge, ProgressBar } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { AES256 } from '@/lib/crypto/aes256';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface EncryptionStep {
  step: number;
  name: string;
  description: string;
  input: string;
  output: string;
  time: number;
}

export default function CryptoPlayground() {
  const [plaintext, setPlaintext] = useState('Hello, Quantum World!');
  const [password, setPassword] = useState('demo123');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'aes256' | 'qes512'>('qes512');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [encryptionSteps, setEncryptionSteps] = useState<EncryptionStep[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);

  const qes512 = new QES512();
  const aes256 = new AES256();

  const simulateEncryptionSteps = (algorithm: string): EncryptionStep[] => {
    const steps: EncryptionStep[] = [
      {
        step: 1,
        name: 'Key Generation',
        description: 'Generate encryption key from password using PBKDF2',
        input: password,
        output: 'Generated 512-bit key (simulated)',
        time: Math.random() * 5 + 1
      },
      {
        step: 2,
        name: 'IV Generation',
        description: 'Generate random initialization vector',
        input: 'Random seed',
        output: '128-bit IV',
        time: Math.random() * 2 + 0.5
      },
      {
        step: 3,
        name: 'Padding',
        description: 'Add padding to plaintext for block alignment',
        input: plaintext,
        output: plaintext + ' (padded)',
        time: Math.random() * 1 + 0.1
      }
    ];

    if (algorithm === 'qes512') {
      steps.push(
        {
          step: 4,
          name: 'First Layer Encryption',
          description: 'Encrypt with first AES-256 key',
          input: 'Padded plaintext',
          output: 'First layer ciphertext',
          time: Math.random() * 10 + 5
        },
        {
          step: 5,
          name: 'Second Layer Encryption',
          description: 'Encrypt with second AES-256 key',
          input: 'First layer ciphertext',
          output: 'Final QES-512 ciphertext',
          time: Math.random() * 10 + 5
        }
      );
    } else {
      steps.push({
        step: 4,
        name: 'AES-256 Encryption',
        description: 'Encrypt using AES-256 algorithm',
        input: 'Padded plaintext',
        output: 'AES-256 ciphertext',
        time: Math.random() * 8 + 3
      });
    }

    return steps;
  };

  const encryptText = async () => {
    if (!plaintext || !password) return;

    const startTime = performance.now();
    let result;
    
    if (selectedAlgorithm === 'qes512') {
      result = qes512.encrypt(plaintext, password);
    } else {
      result = aes256.encrypt(plaintext, password);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    setEncryptedData(result);
    setPerformanceData({
      algorithm: result.algorithm,
      encryptionTime: result.encryptionTime,
      ciphertextSize: result.ciphertextSize,
      throughput: new TextEncoder().encode(plaintext).length / (result.encryptionTime / 1000),
      totalTime
    });

    // Simulate encryption steps
    const steps = simulateEncryptionSteps(selectedAlgorithm);
    setEncryptionSteps(steps);
    setShowSteps(true);
  };

  const decryptText = async () => {
    if (!encryptedData || !password) return;

    try {
      let result;
      if (selectedAlgorithm === 'qes512') {
        result = qes512.decrypt(encryptedData.ciphertext, password, encryptedData.iv);
      } else {
        result = aes256.decrypt(encryptedData.ciphertext, password, encryptedData.iv);
      }

      setDecryptedText(result.plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
      setDecryptedText('Decryption failed - check password');
    }
  };

  const resetDemo = () => {
    setEncryptedData(null);
    setDecryptedText('');
    setEncryptionSteps([]);
    setShowSteps(false);
    setPerformanceData(null);
  };

  const analyzeText = () => {
    if (!plaintext) return;
    return CryptoAnalyzer.generateEntropyVisualization(plaintext);
  };

  const entropyData = analyzeText();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cryptography Playground</h1>
        <p className="text-lg text-gray-600">
          Interactive learning environment for encryption concepts
        </p>
      </div>

      {/* Algorithm Selection */}
      <Card title="Encryption Algorithm">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="algorithm"
              value="qes512"
              checked={selectedAlgorithm === 'qes512'}
              onChange={(e) => setSelectedAlgorithm(e.target.value as 'aes256' | 'qes512')}
              className="mr-2"
            />
            <span className="text-sm font-medium">QES-512 (Experimental)</span>
            <Badge variant="warning" size="sm" className="ml-2">Experimental</Badge>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="algorithm"
              value="aes256"
              checked={selectedAlgorithm === 'aes256'}
              onChange={(e) => setSelectedAlgorithm(e.target.value as 'aes256' | 'qes512')}
              className="mr-2"
            />
            <span className="text-sm font-medium">AES-256 (Standard)</span>
            <Badge variant="success" size="sm" className="ml-2">Standard</Badge>
          </label>
        </div>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Input Data">
          <div className="space-y-4">
            <Textarea
              label="Plaintext"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter text to encrypt"
              rows={4}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter encryption password"
            />
            <div className="flex space-x-2">
              <Button onClick={encryptText} disabled={!plaintext || !password}>
                <Lock className="h-4 w-4 mr-2" />
                Encrypt
              </Button>
              <Button onClick={resetDemo} variant="secondary">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Text Analysis">
          {entropyData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Entropy</p>
                  <p className="text-lg font-bold text-blue-600">{entropyData.entropy.toFixed(2)} bits</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Possible</p>
                  <p className="text-lg font-bold text-gray-600">{entropyData.maxEntropy.toFixed(2)} bits</p>
                </div>
              </div>
              <ProgressBar
                value={entropyData.percentage}
                label="Entropy Efficiency"
              />
              <div>
                <p className="text-sm text-gray-500 mb-2">Character Distribution</p>
                <div className="space-y-1">
                  {Object.entries(entropyData.characterDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([char, count]) => (
                      <div key={char} className="flex justify-between text-sm">
                        <span className="font-mono">{char === ' ' ? 'Space' : char}</span>
                        <span className="text-gray-600">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Encryption Steps Visualization */}
      {showSteps && encryptionSteps.length > 0 && (
        <Card title="Encryption Process Visualization">
          <div className="space-y-4">
            {encryptionSteps.map((step, index) => (
              <div key={step.step} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{step.time.toFixed(1)}ms</p>
                    <ProgressBar
                      value={(step.time / Math.max(...encryptionSteps.map(s => s.time))) * 100}
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Input</p>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded">{step.input}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Output</p>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded">{step.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results Section */}
      {encryptedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Encrypted Result">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Ciphertext (Base64)</p>
                <p className="text-xs font-mono break-all">{encryptedData.ciphertext}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Algorithm</p>
                  <p className="font-medium">{encryptedData.algorithm}</p>
                </div>
                <div>
                  <p className="text-gray-500">Key Size</p>
                  <p className="font-medium">{encryptedData.keySize} bits</p>
                </div>
                <div>
                  <p className="text-gray-500">Block Size</p>
                  <p className="font-medium">{encryptedData.blockSize} bits</p>
                </div>
                <div>
                  <p className="text-gray-500">Rounds</p>
                  <p className="font-medium">{encryptedData.rounds}</p>
                </div>
              </div>
              <Button onClick={decryptText} variant="secondary">
                <Eye className="h-4 w-4 mr-2" />
                Decrypt
              </Button>
            </div>
          </Card>

          <Card title="Performance Metrics">
            {performanceData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Encryption Time</p>
                    <p className="text-lg font-bold text-blue-600">{performanceData.encryptionTime.toFixed(2)}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Throughput</p>
                    <p className="text-lg font-bold text-green-600">
                      {CryptoAnalyzer.formatThroughput(performanceData.throughput)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ciphertext Size</p>
                    <p className="text-lg font-bold text-gray-600">{performanceData.ciphertextSize} bytes</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expansion Ratio</p>
                    <p className="text-lg font-bold text-orange-600">
                      {(performanceData.ciphertextSize / new TextEncoder().encode(plaintext).length).toFixed(2)}x
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <ProgressBar
                    value={(performanceData.encryptionTime / 100) * 100}
                    label="Encryption Speed"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Decrypted Result */}
      {decryptedText && (
        <Card title="Decrypted Result">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Decrypted Plaintext</p>
            <p className="text-lg font-mono">{decryptedText}</p>
          </div>
        </Card>
      )}

      {/* Educational Information */}
      <Card title="Learning Resources">
        <div className="space-y-4">
          <Alert type="info">
            <div className="flex items-start">
              <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Understanding Encryption</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• <strong>Key Generation:</strong> Password-based key derivation using PBKDF2</li>
                  <li>• <strong>IV (Initialization Vector):</strong> Random value to ensure unique ciphertext</li>
                  <li>• <strong>Padding:</strong> Adding data to align with block size requirements</li>
                  <li>• <strong>Encryption Rounds:</strong> Multiple transformations for security</li>
                </ul>
              </div>
            </div>
          </Alert>
          
          <Alert type="warning">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">QES-512 Implementation</h4>
                <p className="text-sm mt-1">
                  This experimental algorithm uses layered AES-256 encryption to simulate 512-bit equivalent security.
                  It's designed for educational purposes and demonstrates concepts of enhanced symmetric encryption.
                </p>
              </div>
            </div>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
