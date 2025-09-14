/**
 * Secure File Vault - Main page with drag-and-drop file encryption
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
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, Button, Alert, ProgressBar, Badge } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { AES256 } from '@/lib/crypto/aes256';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface FileData {
  file: File;
  encrypted?: string;
  iv?: string;
  algorithm?: string;
  encryptionTime?: number;
  ciphertextSize?: number;
  throughput?: number;
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
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'aes256' | 'qes512'>('qes512');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [results, setResults] = useState<EncryptionResult[]>([]);

  const qes512 = new QES512();
  const aes256 = new AES256();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ file }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB limit
  });

  const encryptFiles = async () => {
    if (!password || files.length === 0) return;

    setIsEncrypting(true);
    const encryptionResults = [];

    for (const fileData of files) {
      try {
        const fileContent = await fileData.file.text();
        
        let result;
        if (selectedAlgorithm === 'qes512') {
          result = qes512.encrypt(fileContent, password);
        } else {
          result = aes256.encrypt(fileContent, password);
        }

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
                throughput
              }
            : f
        ));
      } catch (error) {
        console.error('Encryption error:', error);
      }
    }

    setResults(encryptionResults);
    setIsEncrypting(false);
  };

  const decryptFiles = async () => {
    if (!password || files.length === 0) return;

    setIsDecrypting(true);

    for (const fileData of files) {
      if (fileData.encrypted && fileData.iv) {
        try {
          let result;
          if (fileData.algorithm?.includes('QES-512')) {
            result = qes512.decrypt(fileData.encrypted, password, fileData.iv);
          } else {
            result = aes256.decrypt(fileData.encrypted, password, fileData.iv);
          }

          // Create download link
          const blob = new Blob([result.plaintext], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileData.file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Decryption error:', error);
        }
      }
    }

    setIsDecrypting(false);
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Secure File Vault</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Encrypt and decrypt files using AES-256 or experimental QES-512 with real-time performance metrics
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

      {/* Password Input */}
      <Card title="Encryption Password">
        <div className="max-w-md">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter encryption password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
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
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 100MB
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
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{fileData.file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(fileData.file.size)}</p>
                    {fileData.encrypted && (
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Encrypted</span>
                        <Badge variant="info" size="sm">{fileData.algorithm}</Badge>
                      </div>
                    )}
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
              onClick={encryptFiles}
              loading={isEncrypting}
              disabled={isDecrypting}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Encrypt Files
            </Button>
            <Button
              onClick={decryptFiles}
              variant="secondary"
              loading={isDecrypting}
              disabled={isEncrypting}
              className="flex-1"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Decrypt Files
            </Button>
            <Button
              onClick={clearFiles}
              variant="danger"
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        </Card>
      )}

      {/* Performance Results */}
      {results.length > 0 && (
        <Card title="Performance Metrics">
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                  <Badge variant="info">{result.algorithm}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-medium">{formatFileSize(result.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Encryption Time</p>
                    <p className="font-medium">{result.encryptionTime.toFixed(2)}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Throughput</p>
                    <p className="font-medium">{CryptoAnalyzer.formatThroughput(result.throughput)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ciphertext Size</p>
                    <p className="font-medium">{formatFileSize(result.ciphertextSize)}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">AES-256</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Industry standard encryption</li>
                <li>• 256-bit key strength</li>
                <li>• 128-bit quantum resistance</li>
                <li>• Widely tested and validated</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">QES-512 (Experimental)</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Simulated 512-bit equivalent</li>
                <li>• Layered AES-256 approach</li>
                <li>• 256-bit quantum resistance</li>
                <li>• Educational demonstration only</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}