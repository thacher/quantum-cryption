/**
 * Performance Analysis - Comprehensive metrics and quantum threat analysis
 */

'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Card, Button, Alert, Badge, ProgressBar } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { AES256 } from '@/lib/crypto/aes256';
import { HybridEncryption } from '@/lib/crypto/hybrid';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface PerformanceTest {
  algorithm: string;
  keySize: number;
  encryptionTime: number;
  decryptionTime: number;
  throughput: number;
  memoryUsage: number;
  ciphertextSize: number;
  securityLevel: {
    classicalBits: number;
    quantumBits: number;
    classicalComplexity: number;
    quantumComplexity: number;
    bruteForceTime: string;
    quantumBruteForceTime: string;
  };
}

interface QuantumThreatData {
  algorithm: string;
  classicalBits: number;
  quantumBits: number;
  classicalComplexity: number;
  quantumComplexity: number;
  bruteForceTime: string;
  quantumBruteForceTime: string;
  quantumResistance: 'Low' | 'Medium' | 'High' | 'Very High';
}

export default function PerformanceAnalysis() {
  const [testResults, setTestResults] = useState<PerformanceTest[]>([]);
  const [quantumThreatData, setQuantumThreatData] = useState<QuantumThreatData[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testDataSize, setTestDataSize] = useState(1024); // bytes

  const qes512 = new QES512();
  const aes256 = new AES256();
  const hybrid2 = new HybridEncryption(2);
  const hybrid3 = new HybridEncryption(3);

  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    const results: PerformanceTest[] = [];
    const password = 'test-password-123';
    
    // Generate test data
    const testData = 'A'.repeat(testDataSize);
    
    // Test AES-256
    const aesEncrypted = aes256.encrypt(testData, password);
    const aesDecrypted = aes256.decrypt(aesEncrypted.ciphertext, password, aesEncrypted.iv);
    
    results.push({
      algorithm: 'AES-256',
      keySize: 256,
      encryptionTime: aesEncrypted.encryptionTime,
      decryptionTime: aesDecrypted.decryptionTime,
      throughput: aesEncrypted.ciphertextSize / (aesEncrypted.encryptionTime / 1000),
      memoryUsage: aesEncrypted.ciphertextSize * 2, // Rough estimate
      ciphertextSize: aesEncrypted.ciphertextSize,
      securityLevel: aes256.getSecurityLevel()
    });

    // Test QES-512
    const qesEncrypted = qes512.encrypt(testData, password);
    const qesDecrypted = qes512.decrypt(qesEncrypted.ciphertext, password, qesEncrypted.iv);
    
    results.push({
      algorithm: 'QES-512 (Experimental)',
      keySize: 512,
      encryptionTime: qesEncrypted.encryptionTime,
      decryptionTime: qesDecrypted.decryptionTime,
      throughput: qesEncrypted.ciphertextSize / (qesEncrypted.encryptionTime / 1000),
      memoryUsage: qesEncrypted.ciphertextSize * 2.5, // Rough estimate
      ciphertextSize: qesEncrypted.ciphertextSize,
      securityLevel: qes512.getSecurityLevel()
    });

    // Test Hybrid 2 layers
    const hybrid2Encrypted = hybrid2.encrypt(testData, password);
    const hybrid2Decrypted = hybrid2.decrypt(hybrid2Encrypted.ciphertext, password, hybrid2Encrypted.iv);
    
    results.push({
      algorithm: 'Hybrid AES-256 (2 layers)',
      keySize: 512,
      encryptionTime: hybrid2Encrypted.encryptionTime,
      decryptionTime: hybrid2Decrypted.decryptionTime,
      throughput: hybrid2Encrypted.throughput,
      memoryUsage: hybrid2Encrypted.ciphertextSize * 3, // Rough estimate
      ciphertextSize: hybrid2Encrypted.ciphertextSize,
      securityLevel: hybrid2.getSecurityLevel()
    });

    // Test Hybrid 3 layers
    const hybrid3Encrypted = hybrid3.encrypt(testData, password);
    const hybrid3Decrypted = hybrid3.decrypt(hybrid3Encrypted.ciphertext, password, hybrid3Encrypted.iv);
    
    results.push({
      algorithm: 'Hybrid AES-256 (3 layers)',
      keySize: 768,
      encryptionTime: hybrid3Encrypted.encryptionTime,
      decryptionTime: hybrid3Decrypted.decryptionTime,
      throughput: hybrid3Encrypted.throughput,
      memoryUsage: hybrid3Encrypted.ciphertextSize * 4, // Rough estimate
      ciphertextSize: hybrid3Encrypted.ciphertextSize,
      securityLevel: hybrid3.getSecurityLevel()
    });

    setTestResults(results);
    
    // Generate quantum threat analysis
    const quantumData: QuantumThreatData[] = results.map(result => ({
      algorithm: result.algorithm,
      classicalBits: result.securityLevel.classicalBits,
      quantumBits: result.securityLevel.quantumBits,
      classicalComplexity: result.securityLevel.classicalComplexity,
      quantumComplexity: result.securityLevel.quantumComplexity,
      bruteForceTime: result.securityLevel.bruteForceTime,
      quantumBruteForceTime: result.securityLevel.quantumBruteForceTime,
      quantumResistance: CryptoAnalyzer.analyzeQuantumThreat(
        result.algorithm,
        result.securityLevel.classicalBits,
        result.securityLevel.quantumBits
      ).quantumResistance
    }));
    
    setQuantumThreatData(quantumData);
    setIsRunningTests(false);
  };

  const getResistanceColor = (resistance: string) => {
    switch (resistance) {
      case 'Low': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-blue-600';
      case 'Very High': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getResistanceBadgeVariant = (resistance: string) => {
    switch (resistance) {
      case 'Low': return 'error';
      case 'Medium': return 'warning';
      case 'High': return 'info';
      case 'Very High': return 'success';
      default: return 'default';
    }
  };

  const formatComplexity = (complexity: number) => {
    if (complexity >= 1e18) return `${(complexity / 1e18).toFixed(2)} × 10¹⁸`;
    if (complexity >= 1e15) return `${(complexity / 1e15).toFixed(2)} × 10¹⁵`;
    if (complexity >= 1e12) return `${(complexity / 1e12).toFixed(2)} × 10¹²`;
    if (complexity >= 1e9) return `${(complexity / 1e9).toFixed(2)} × 10⁹`;
    if (complexity >= 1e6) return `${(complexity / 1e6).toFixed(2)} × 10⁶`;
    if (complexity >= 1e3) return `${(complexity / 1e3).toFixed(2)} × 10³`;
    return complexity.toString();
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

      {/* Test Configuration */}
      <Card title="Test Configuration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Data Size: {testDataSize} bytes
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={testDataSize}
              onChange={(e) => setTestDataSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100 bytes</span>
              <span>1 KB</span>
              <span>5 KB</span>
              <span>10 KB</span>
            </div>
          </div>
          
          <Button 
            onClick={runPerformanceTests} 
            loading={isRunningTests}
            className="w-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            Run Performance Tests
          </Button>
        </div>
      </Card>

      {/* Performance Results */}
      {testResults.length > 0 && (
        <Card title="Performance Metrics">
          <div className="space-y-6">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{result.algorithm}</h4>
                    <p className="text-sm text-gray-600">{result.keySize} bits • {result.ciphertextSize} bytes output</p>
                  </div>
                  <Badge variant={result.algorithm.includes('Experimental') ? 'warning' : 'success'}>
                    {result.algorithm.includes('Experimental') ? 'Experimental' : 'Standard'}
                  </Badge>
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
                    <p className="text-gray-500">Memory Usage</p>
                    <p className="font-medium">{CryptoAnalyzer.formatThroughput(result.memoryUsage)}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Performance Score</span>
                    <span>{((Math.max(...testResults.map(r => r.throughput)) - result.throughput) / Math.max(...testResults.map(r => r.throughput)) * 100).toFixed(1)}% slower</span>
                  </div>
                  <ProgressBar
                    value={(result.throughput / Math.max(...testResults.map(r => r.throughput))) * 100}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quantum Threat Analysis */}
      {quantumThreatData.length > 0 && (
        <Card title="Quantum Threat Analysis">
          <div className="space-y-6">
            {quantumThreatData.map((threat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{threat.algorithm}</h4>
                    <p className="text-sm text-gray-600">
                      {threat.classicalBits} bits classical • {threat.quantumBits} bits quantum resistance
                    </p>
                  </div>
                  <Badge variant={getResistanceBadgeVariant(threat.quantumResistance)}>
                    {threat.quantumResistance} Resistance
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Classical Complexity</p>
                      <p className="font-medium text-lg">{formatComplexity(threat.classicalComplexity)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantum Complexity</p>
                      <p className="font-medium text-lg">{formatComplexity(threat.quantumComplexity)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Classical Brute Force Time</p>
                      <p className="font-medium">{threat.bruteForceTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantum Brute Force Time</p>
                      <p className="font-medium">{threat.quantumBruteForceTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Quantum Resistance Level</span>
                    <span className={getResistanceColor(threat.quantumResistance)}>{threat.quantumResistance}</span>
                  </div>
                  <ProgressBar
                    value={
                      threat.quantumResistance === 'Low' ? 25 :
                      threat.quantumResistance === 'Medium' ? 50 :
                      threat.quantumResistance === 'High' ? 75 : 100
                    }
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Recommendations */}
      <Card title="Security Recommendations">
        <div className="space-y-4">
          <Alert type="info">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Quantum Computing Threat Assessment</h4>
                <p className="text-sm mt-1">
                  Based on current quantum computing projections, algorithms with quantum resistance 
                  below 128 bits may be vulnerable to future quantum attacks using Grover&apos;s algorithm.
                </p>
              </div>
            </div>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Current Recommendations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use AES-256 for current applications</li>
                <li>• Monitor quantum computing developments</li>
                <li>• Consider post-quantum cryptography for long-term data</li>
                <li>• Implement proper key management practices</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Future Considerations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Transition to post-quantum algorithms when standardized</li>
                <li>• Use hybrid classical-quantum resistant approaches</li>
                <li>• Increase key sizes for critical applications</li>
                <li>• Regular security audits and updates</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Algorithm Comparison Summary */}
      {testResults.length > 0 && (
        <Card title="Algorithm Comparison Summary">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Fastest</p>
                <p className="font-medium">{testResults.reduce((prev, current) => 
                  prev.throughput > current.throughput ? prev : current
                ).algorithm}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Most Secure</p>
                <p className="font-medium">{quantumThreatData.reduce((prev, current) => 
                  prev.quantumBits > current.quantumBits ? prev : current
                ).algorithm}</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Best Balance</p>
                <p className="font-medium">AES-256</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Experimental</p>
                <p className="font-medium">QES-512</p>
              </div>
            </div>
            
            <Alert type="warning">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium">Important Notes</h4>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• QES-512 and Hybrid algorithms are experimental demonstrations only</li>
                    <li>• Performance metrics are based on browser JavaScript implementations</li>
                    <li>• Real-world performance may vary significantly</li>
                    <li>• Always use established cryptographic standards for production systems</li>
                  </ul>
                </div>
              </div>
            </Alert>
          </div>
        </Card>
      )}
    </div>
  );
}
