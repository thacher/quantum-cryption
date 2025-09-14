/**
 * Secure File Vault - Main page with drag-and-drop file encryption using QES512
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  Lock, 
  Unlock, 
  File, 
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Card, Button, Alert, Badge } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface FileData {
  file: File;
  encrypted?: string;
  iv?: string;
  algorithm?: string;
  encryptionTime?: number;
  ciphertextSize?: number;
  throughput?: number;
  isEncrypted?: boolean;
  fileType?: 'encrypted' | 'unencrypted';
}

interface EncryptionResult {
  fileName: string;
  fileSize: number;
  ciphertext: string;
  iv: string;
  algorithm: string;
  encryptionTime: number;
  ciphertextSize: number;
  throughput: number;
}

export default function FileVault() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [password, setPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [results, setResults] = useState<EncryptionResult[]>([]);

  const qes512 = new QES512();

  // Function to detect if a file is encrypted based on file extension
  const detectFileType = (file: File): 'encrypted' | 'unencrypted' => {
    // Check if file has .encrypted extension
    const isEncrypted = file.name.toLowerCase().endsWith('.encrypted');
    console.log(`File: ${file.name}, Detected as: ${isEncrypted ? 'encrypted' : 'unencrypted'}`);
    return isEncrypted ? 'encrypted' : 'unencrypted';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileType = detectFileType(file);
      return { 
        file, 
        fileType,
        isEncrypted: fileType === 'encrypted'
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB limit
  });

  const processFiles = async () => {
    if (!password || files.length === 0) return;

    const unencryptedFiles = files.filter(f => f.fileType === 'unencrypted');
    const encryptedFiles = files.filter(f => f.fileType === 'encrypted');

    // Process unencrypted files (encrypt them)
    if (unencryptedFiles.length > 0) {
      setIsEncrypting(true);
      const encryptionResults = [];

      for (const fileData of unencryptedFiles) {
        try {
          // Read file as ArrayBuffer to handle both text and binary files
          const arrayBuffer = await fileData.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to base64 efficiently to avoid call stack overflow
          let binaryString = '';
          const chunkSize = 8192; // Process in chunks
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            binaryString += String.fromCharCode(...chunk);
          }
          const fileContent = btoa(binaryString);
          
          const result = qes512.encrypt(fileContent, password);
          const throughput = fileData.file.size / (result.encryptionTime / 1000);

          encryptionResults.push({
            fileName: fileData.file.name,
            fileSize: fileData.file.size,
            algorithm: result.algorithm,
            encryptionTime: result.encryptionTime,
            ciphertextSize: result.ciphertextSize,
            throughput,
            ciphertext: result.ciphertext,
            iv: result.iv
          });

          // Update file data
          setFiles(prev => prev.map(f => 
            f.file === fileData.file 
              ? { 
                  ...f, 
                  encrypted: result.ciphertext, 
                  iv: result.iv, 
                  algorithm: result.algorithm,
                  encryptionTime: result.encryptionTime,
                  ciphertextSize: result.ciphertextSize,
                  throughput,
                  isEncrypted: true,
                  fileType: 'encrypted'
                }
              : f
          ));

          // Download the encrypted file with .encrypted extension
          const encryptedData = {
            ciphertext: result.ciphertext,
            iv: result.iv,
            salt: result.salt,
            algorithm: result.algorithm,
            layers: result.layers || 2
          };
          downloadFile(JSON.stringify(encryptedData, null, 2), `${fileData.file.name}.encrypted`);
        } catch (error) {
          console.error('Encryption error:', error);
        }
      }

      setResults(encryptionResults);
      setIsEncrypting(false);
      
      // Clear files after successful encryption
      setFiles([]);
    }

    // Process encrypted files (decrypt and download them)
    if (encryptedFiles.length > 0) {
      setIsDecrypting(true);

      for (const fileData of encryptedFiles) {
        try {
          const fileContent = await fileData.file.text();
          
          // Try to parse as JSON first (structured encrypted data)
          let encryptedData;
          try {
            encryptedData = JSON.parse(fileContent);
            if (encryptedData.ciphertext && encryptedData.iv && encryptedData.salt) {
              const result = qes512.decrypt(encryptedData.ciphertext, password, encryptedData.iv, encryptedData.salt);
              
              // Convert base64 back to binary efficiently
              const binaryString = atob(result.plaintext);
              const uint8Array = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([uint8Array]);
              
              // Remove .encrypted extension from filename
              const originalName = fileData.file.name.replace(/\.encrypted$/i, '');
              downloadFile(blob, originalName);
            }
          } catch {
            // If not JSON, we can't decrypt without proper structure
            alert(`Cannot decrypt ${fileData.file.name}. File must contain structured encrypted data with ciphertext, iv, and salt.`);
          }
        } catch (error) {
          console.error('Decryption error:', error);
          alert(`Failed to decrypt ${fileData.file.name}. Please check your password.`);
        }
      }

      setIsDecrypting(false);
      
      // Clear files after successful decryption
      setFiles([]);
    }
  };

  const downloadFile = (content: string | Blob, filename: string) => {
    let blob: Blob;
    if (typeof content === 'string') {
      blob = new Blob([content], { type: 'text/plain' });
    } else {
      blob = content;
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFiles = () => {
    setFiles([]);
    setResults([]);
  };

  const downloadEncrypted = (fileData: FileData) => {
    if (!fileData.encrypted) return;

    const blob = new Blob([fileData.encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileData.file.name}.encrypted`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      {/* Algorithm Information */}
      <Card title="Encryption Algorithm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm font-medium">QES-512 (Experimental)</span>
            <Badge variant="warning" size="sm" className="ml-2">Experimental</Badge>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Simulated 512-bit equivalent encryption using layered AES-256
          </div>
        </div>
      </Card>

      {/* Password Input */}
      <Card title="Encryption Password">
        <div className="max-w-md">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter encryption password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Use a strong password for better security
          </p>
        </div>
      </Card>

      {/* File Drop Zone */}
      <Card title="Upload Files">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop files here, or click to select
              </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maximum file size: 100MB. Encrypted files (.encrypted) will be automatically decrypted.
          </p>
            </div>
          )}
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card title="Files">
          <div className="space-y-4">
            {files.map((fileData, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{fileData.file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(fileData.file.size)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {fileData.fileType === 'encrypted' ? (
                        <>
                          <Lock className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">Encrypted File</span>
                          <Badge variant="error" size="sm">Will Decrypt</Badge>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Unencrypted File</span>
                          <Badge variant="success" size="sm">Will Encrypt</Badge>
                        </>
                      )}
                      {fileData.encrypted && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Processed</span>
                          <Badge variant="info" size="sm">{fileData.algorithm}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {fileData.encrypted && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadEncrypted(fileData)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Encrypted
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {files.length > 0 && password && (
        <Card>
          <div className="flex space-x-4">
            <Button
              onClick={processFiles}
              loading={isEncrypting || isDecrypting}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Process Files Automatically
            </Button>
            <Button
              onClick={clearFiles}
              variant="danger"
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Unencrypted files will be encrypted, encrypted files will be decrypted and downloaded automatically.
          </p>
        </Card>
      )}

      {/* Performance Results */}
      {results.length > 0 && (
        <Card title="Performance Metrics">
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{result.fileName}</h4>
                  <Badge variant="info">{result.algorithm}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">File Size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatFileSize(result.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Encryption Time</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{result.encryptionTime.toFixed(2)}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Throughput</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{CryptoAnalyzer.formatThroughput(result.throughput)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Ciphertext Size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatFileSize(result.ciphertextSize)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Information */}
      <Card title="Security Information">
        <div className="space-y-4">
          <Alert type="warning">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Experimental Algorithm Warning</h4>
                <p className="text-sm mt-1">
                  QES-512 is an experimental implementation for educational purposes only. 
                  It uses layered AES-256 encryption to simulate 512-bit equivalent security.
                </p>
              </div>
            </div>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">QES-512 (Experimental)</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Simulated 512-bit equivalent encryption</li>
              <li>• Layered AES-256 approach for enhanced security</li>
              <li>• 256-bit quantum resistance</li>
              <li>• Educational demonstration only</li>
              <li>• Not suitable for production use</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}