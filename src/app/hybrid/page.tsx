/**
 * Hybrid Encryption Demo - Multiple AES-256 rounds simulation
 */

'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Lock, 
  Unlock, 
  RotateCcw, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Input, Textarea, Alert, Badge, ProgressBar } from '@/components/ui';
import { HybridEncryption } from '@/lib/crypto/hybrid';
import { QES512 } from '@/lib/crypto/qes512';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface ComparisonResult {
  algorithm: string;
  layers: number;
  encryptionTime: number;
  decryptionTime: number;
  throughput: number;
  ciphertextSize: number;
  totalKeySize: number;
  securityLevel: {
    classicalBits: number;
    quantumBits: number;
    classicalComplexity: number;
    quantumComplexity: number;
    bruteForceTime: string;
    quantumBruteForceTime: string;
  };
}

export default function HybridDemo() {
  const [plaintext, setPlaintext] = useState('This is a test message for hybrid encryption demonstration.');
  const [password, setPassword] = useState('demo123');
  const [layers, setLayers] = useState(2);
  const [encryptedData, setEncryptedData] = useState<{
    ciphertext: string;
    iv: string;
    algorithm: string;
    layers: number;
    totalKeySize: number;
    encryptionTime: number;
    ciphertextSize: number;
    throughput: number;
  } | null>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isRunningComparison, setIsRunningComparison] = useState(false);

  const hybridEncryption = new HybridEncryption(layers);
  const qes512 = new QES512();

  const encryptWithHybrid = async () => {
    if (!plaintext || !password) return;

    const result = hybridEncryption.encrypt(plaintext, password);
    setEncryptedData(result);
  };

  const decryptWithHybrid = async () => {
    if (!encryptedData || !password) return;

    try {
      const result = hybridEncryption.decrypt(encryptedData.ciphertext, password, encryptedData.iv);
      setDecryptedText(result.plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
      setDecryptedText('Decryption failed - check password');
    }
  };

  const runPerformanceComparison = async () => {
    if (!plaintext || !password) return;

    setIsRunningComparison(true);
    const results: ComparisonResult[] = [];

    // Test different layer configurations
    for (let layerCount = 1; layerCount <= 4; layerCount++) {
      const hybrid = new HybridEncryption(layerCount);
      
      // Encrypt with hybrid
      const hybridResult = hybrid.encrypt(plaintext, password);
      
      // Decrypt with hybrid
      const hybridDecryptResult = hybrid.decrypt(hybridResult.ciphertext, password, hybridResult.iv);
      
      // Get security level
      const securityLevel = hybrid.getSecurityLevel();

      results.push({
        algorithm: `Hybrid AES-256 (${layerCount} layers)`,
        layers: layerCount,
        encryptionTime: hybridResult.encryptionTime,
        decryptionTime: hybridDecryptResult.decryptionTime,
        throughput: hybridResult.throughput,
        ciphertextSize: hybridResult.ciphertextSize,
        totalKeySize: hybridResult.totalKeySize,
        securityLevel
      });
    }

    // Test QES-512 for comparison
    const qesResult = qes512.encrypt(plaintext, password);
    const qesDecryptResult = qes512.decrypt(qesResult.ciphertext, password, qesResult.iv, qesResult.salt);
    const qesSecurityLevel = qes512.getInfo().securityLevel;

    results.push({
      algorithm: 'QES-512 (Experimental)',
      layers: 2,
      encryptionTime: qesResult.encryptionTime,
      decryptionTime: qesDecryptResult.decryptionTime,
      throughput: new TextEncoder().encode(plaintext).length / (qesResult.encryptionTime / 1000),
      ciphertextSize: qesResult.ciphertextSize,
      totalKeySize: 512,
      securityLevel: qesSecurityLevel
    });

    setComparisonResults(results);
    setIsRunningComparison(false);
  };

  const resetDemo = () => {
    setEncryptedData(null);
    setDecryptedText('');
    setComparisonResults([]);
  };

  const getPerformanceImpact = (layers: number) => {
    if (layers === 1) return 'Baseline';
    const impact = layers * 1.5; // Rough estimate
    return `${impact.toFixed(1)}x slower`;
  };

  const getSecurityGain = (layers: number) => {
    if (layers === 1) return 'Standard';
    const gain = layers * 2; // Rough estimate
    return `${gain}x stronger`;
  };

  return (
    <div className="space-y-6">
      {/* Educational Warning */}
      <div className="mb-8 rounded-xl bg-warning-50 border border-warning-200 p-6 dark:bg-warning-900/20 dark:border-warning-800 animate-slide-up">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-warning-800 dark:text-white">
              ⚠️ Educational Use Only
            </h3>
            <div className="mt-2 text-sm text-warning-700 dark:text-white">
              <p>
                This application demonstrates experimental QES (Quantum Encryption Standard) 
                for research and educational purposes only. QES is not an officially recognized 
                cryptographic standard. Do not use for production or real-world sensitive data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Configuration */}
      <Card title="Encryption Configuration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Encryption Layers: {layers}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={layers}
              onChange={(e) => {
                setLayers(parseInt(e.target.value));
                hybridEncryption.setLayers(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Layer</span>
              <span>2 Layers</span>
              <span>3 Layers</span>
              <span>4 Layers</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-gray-500">Total Key Size</p>
              <p className="text-lg font-bold text-blue-600">{256 * layers} bits</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-gray-500">Performance Impact</p>
              <p className="text-lg font-bold text-yellow-600">{getPerformanceImpact(layers)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-gray-500">Security Gain</p>
              <p className="text-lg font-bold text-green-600">{getSecurityGain(layers)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Test Data">
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
              <Button onClick={encryptWithHybrid} disabled={!plaintext || !password}>
                <Lock className="h-4 w-4 mr-2" />
                Encrypt ({layers} layers)
              </Button>
              <Button onClick={resetDemo} variant="secondary">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Algorithm Information">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Hybrid AES-256 ({layers} layers)</span>
              <Badge variant="info" size="sm">Experimental</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Effective Key Size:</span>
                <span className="font-medium">{256 * layers} bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Block Size:</span>
                <span className="font-medium">128 bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Encryption Rounds:</span>
                <span className="font-medium">{14 * layers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantum Resistance:</span>
                <span className="font-medium">{128 * layers} bits</span>
              </div>
            </div>

            <Alert type="info">
              <p className="text-sm">
                This hybrid approach chains multiple AES-256 encryption rounds 
                to simulate enhanced security. Each layer uses a different derived key.
              </p>
            </Alert>
          </div>
        </Card>
      </div>

      {/* Results Section */}
      {encryptedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Encryption Result">
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
                  <p className="text-gray-500">Layers</p>
                  <p className="font-medium">{encryptedData.layers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Key Size</p>
                  <p className="font-medium">{encryptedData.totalKeySize} bits</p>
                </div>
                <div>
                  <p className="text-gray-500">Encryption Time</p>
                  <p className="font-medium">{encryptedData.encryptionTime.toFixed(2)}ms</p>
                </div>
              </div>
              <Button onClick={decryptWithHybrid} variant="secondary">
                <Unlock className="h-4 w-4 mr-2" />
                Decrypt
              </Button>
            </div>
          </Card>

          <Card title="Performance Metrics">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Throughput</p>
                  <p className="text-lg font-bold text-green-600">
                    {CryptoAnalyzer.formatThroughput(encryptedData.throughput)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ciphertext Size</p>
                  <p className="text-lg font-bold text-gray-600">{encryptedData.ciphertextSize} bytes</p>
                </div>
                <div>
                  <p className="text-gray-500">Expansion Ratio</p>
                  <p className="text-lg font-bold text-orange-600">
                    {(encryptedData.ciphertextSize / new TextEncoder().encode(plaintext).length).toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Performance Impact</p>
                  <p className="text-lg font-bold text-yellow-600">{getPerformanceImpact(layers)}</p>
                </div>
              </div>
            </div>
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

      {/* Performance Comparison */}
      <Card title="Performance Comparison">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Layer Comparison Analysis</h3>
            <Button 
              onClick={runPerformanceComparison} 
              loading={isRunningComparison}
              disabled={!plaintext || !password}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Comparison
            </Button>
          </div>

          {comparisonResults.length > 0 && (
            <div className="space-y-4">
              {comparisonResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{result.algorithm}</h4>
                      <p className="text-sm text-gray-600">
                        {result.layers} layer{result.layers > 1 ? 's' : ''} • {result.totalKeySize} bits total
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={result.layers === 1 ? "success" : "info"}>
                        {result.layers === 1 ? "Standard" : "Hybrid"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Encryption Time</p>
                      <p className="font-medium">{result.encryptionTime.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Decryption Time</p>
                      <p className="font-medium">{result.decryptionTime.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Throughput</p>
                      <p className="font-medium">{CryptoAnalyzer.formatThroughput(result.throughput)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ciphertext Size</p>
                      <p className="font-medium">{result.ciphertextSize} bytes</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Performance Impact</span>
                      <span>{getPerformanceImpact(result.layers)}</span>
                    </div>
                    <ProgressBar
                      value={(result.encryptionTime / Math.max(...comparisonResults.map(r => r.encryptionTime))) * 100}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Educational Information */}
      <Card title="Understanding Hybrid Encryption">
        <div className="space-y-4">
          <Alert type="info">
            <div className="flex items-start">
              <Layers className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">How Hybrid Encryption Works</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• <strong>Layer 1:</strong> Encrypt plaintext with first AES-256 key</li>
                  <li>• <strong>Layer 2:</strong> Encrypt result with second AES-256 key</li>
                  <li>• <strong>Additional Layers:</strong> Continue encryption with derived keys</li>
                  <li>• <strong>Security:</strong> Each layer adds complexity and key space</li>
                </ul>
              </div>
            </div>
          </Alert>
          
          <Alert type="warning">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Trade-offs and Considerations</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• <strong>Performance:</strong> More layers = slower encryption/decryption</li>
                  <li>• <strong>Security:</strong> Theoretical security increase vs. practical implementation</li>
                  <li>• <strong>Complexity:</strong> More complex key management and error handling</li>
                  <li>• <strong>Standards:</strong> Not a recognized cryptographic standard</li>
                </ul>
              </div>
            </div>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Advantages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Increased theoretical key space</li>
                <li>• Enhanced resistance to certain attacks</li>
                <li>• Educational value for understanding layered security</li>
                <li>• Configurable security-performance trade-off</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Disadvantages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Significant performance overhead</li>
                <li>• Complex key management</li>
                <li>• Not cryptographically analyzed</li>
                <li>• Potential for implementation errors</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
