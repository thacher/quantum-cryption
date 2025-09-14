/**
 * Quantum-Resistant Password Manager Demo using QES512
 */

'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Copy, 
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Upload,
  FileText
} from 'lucide-react';
import { Card, Button, Input, Alert, Badge, ProgressBar } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';
import { useDropzone } from 'react-dropzone';

interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  website: string;
  encrypted?: string;
  iv?: string;
  salt?: string;
  algorithm?: string;
}

export default function PasswordManager() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [newEntry, setNewEntry] = useState({
    name: '',
    username: '',
    password: '',
    website: ''
  });
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [entropyAnalysis, setEntropyAnalysis] = useState<{
    entropy: number;
    maxEntropy: number;
    percentage: number;
    characterDistribution: { [key: string]: number };
  } | null>(null);

  const qes512 = new QES512();

  const addEntry = () => {
    if (!masterPassword) {
      alert('Please set a master password before adding password entries.');
      return;
    }
    
    if (!newEntry.name || !newEntry.username || !newEntry.password) return;

    const entry: PasswordEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setEntries(prev => [...prev, entry]);
    setNewEntry({ name: '', username: '', password: '', website: '' });
  };

  const encryptPasswords = async () => {
    if (!masterPassword || entries.length === 0) return;

    const passwordData = JSON.stringify(entries);
    const result = qes512.encrypt(passwordData, masterPassword);

    // Update entries with encrypted data
    setEntries(prev => prev.map(entry => ({
      ...entry,
      encrypted: result.ciphertext,
      iv: result.iv,
      algorithm: result.algorithm
    })));

    setIsEncrypted(true);

    // Download encrypted passwords file (matching File Vault structure)
    const encryptedData = {
      ciphertext: result.ciphertext,
      iv: result.iv,
      salt: result.salt,
      algorithm: result.algorithm,
      layers: result.layers || 2
    };

    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${new Date().toISOString().split('T')[0]}.encrypted`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const decryptPasswords = async () => {
    if (!masterPassword || !isEncrypted) return;

    try {
      const firstEntry = entries.find(e => e.encrypted);
      if (!firstEntry?.encrypted || !firstEntry?.iv) return;

      const result = qes512.decrypt(firstEntry.encrypted, masterPassword, firstEntry.iv, firstEntry.salt);

      const decryptedEntries = JSON.parse(result.plaintext);
      setEntries(decryptedEntries);
      setIsEncrypted(false);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Please check your master password.');
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Function to detect if a file is encrypted based on file extension
  const detectFileType = (file: File): 'encrypted' | 'unencrypted' => {
    // Check if file has .encrypted extension
    if (file.name.toLowerCase().endsWith('.encrypted')) {
      return 'encrypted';
    }
    return 'unencrypted';
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileType = detectFileType(file);
      if (fileType === 'encrypted') {
        setUploadedFile(file);
      } else {
        alert('Please upload a .encrypted file. Only encrypted password files are supported.');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB limit for password files
  });

  const uploadAndDecryptPasswords = async () => {
    if (!uploadedFile || !masterPassword) return;

    setIsProcessingFile(true);
    try {
      const fileContent = await uploadedFile.text();
      const encryptedData = JSON.parse(fileContent);
      
      const result = qes512.decrypt(
        encryptedData.ciphertext,
        masterPassword,
        encryptedData.iv,
        encryptedData.salt
      );

      const decryptedEntries = JSON.parse(result.plaintext);
      setEntries(decryptedEntries);
      setIsEncrypted(true);
      setUploadedFile(null);
    } catch (error) {
      console.error('Decryption error:', error);
      alert('Failed to decrypt password file. Please check your master password.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const analyzePasswordEntropy = (password: string) => {
    const analysis = CryptoAnalyzer.generateEntropyVisualization(password);
    setEntropyAnalysis(analysis);
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'text-red-600';
    if (strength <= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
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

      {/* Master Password */}
      <Card title="Master Password">
        <div className="max-w-md space-y-4">
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter master password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <div className="flex space-x-2">
            <Button
              onClick={encryptPasswords}
              disabled={!masterPassword || entries.length === 0 || isEncrypted}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Encrypt Passwords
            </Button>
            <Button
              onClick={decryptPasswords}
              variant="secondary"
              disabled={!masterPassword || !isEncrypted}
              className="flex-1"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Decrypt Passwords
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Encrypted Passwords */}
      <Card title="Upload Encrypted Passwords">
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive
                ? 'Drop the encrypted file here...'
                : 'Drag & drop an encrypted password file (.encrypted) here, or click to select'}
            </p>
          </div>

          {uploadedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadedFile.name}
                </span>
              </div>
              <Button
                onClick={uploadAndDecryptPasswords}
                disabled={!masterPassword || isProcessingFile}
                size="sm"
              >
                {isProcessingFile ? 'Decrypting...' : 'Decrypt & Load'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add New Entry */}
      <Card title="Add New Password Entry">
        {!masterPassword ? (
          <div className="text-center py-8">
            <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Master Password Required
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please set a master password above before adding password entries.
            </p>
            <Alert type="warning">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium">Security Notice</h4>
                  <p className="text-sm mt-1">
                    A master password is required to encrypt and secure your password entries.
                  </p>
                </div>
              </div>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Service Name"
              value={newEntry.name}
              onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Gmail, Facebook"
            />
            <Input
              label="Username/Email"
              value={newEntry.username}
              onChange={(e) => setNewEntry(prev => ({ ...prev, username: e.target.value }))}
              placeholder="username@example.com"
            />
            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                value={newEntry.password}
                onChange={(e) => {
                  setNewEntry(prev => ({ ...prev, password: e.target.value }));
                  analyzePasswordEntropy(e.target.value);
                }}
                placeholder="Enter password"
              />
              {newEntry.password && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Strength:</span>
                  <span className={`text-sm font-medium ${getStrengthColor(getPasswordStrength(newEntry.password))}`}>
                    {getStrengthLabel(getPasswordStrength(newEntry.password))}
                  </span>
                  <ProgressBar
                    value={getPasswordStrength(newEntry.password)}
                    max={6}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
            <Input
              label="Website"
              value={newEntry.website}
              onChange={(e) => setNewEntry(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
        )}
        <div className="mt-4">
          <Button 
            onClick={addEntry} 
            disabled={!masterPassword || !newEntry.name || !newEntry.username || !newEntry.password}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </Card>

      {/* Entropy Analysis */}
      {entropyAnalysis && (
        <Card title="Password Entropy Analysis">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Entropy</p>
                <p className="text-2xl font-bold text-blue-600">{entropyAnalysis.entropy.toFixed(2)}</p>
                <p className="text-xs text-gray-500">bits</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Max Possible</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{entropyAnalysis.maxEntropy.toFixed(2)}</p>
                <p className="text-xs text-gray-500">bits</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Efficiency</p>
                <p className="text-2xl font-bold text-green-600">{entropyAnalysis.percentage.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">of maximum</p>
              </div>
            </div>
            <ProgressBar
              value={entropyAnalysis.percentage}
              label="Entropy Efficiency"
            />
          </div>
        </Card>
      )}

      {/* Password Entries */}
      {entries.length > 0 && (
        <Card title="Password Entries">
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{entry.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{entry.username}</p>
                    {entry.website && (
                      <p className="text-sm text-blue-600">{entry.website}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEncrypted && (
                      <Badge variant="success" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-mono">
                      {showPasswords[entry.id] ? entry.password : '••••••••••••'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => togglePasswordVisibility(entry.id)}
                    >
                      {showPasswords[entry.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(entry.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {entry.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Strength:</span>
                      <span className={`text-xs font-medium ${getStrengthColor(getPasswordStrength(entry.password))}`}>
                        {getStrengthLabel(getPasswordStrength(entry.password))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Information */}
      <Card title="Security Information">
        <div className="space-y-4">
          <Alert type="info">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Vault Encryption</h4>
                <p className="text-sm mt-1">
                  Your password vault is encrypted using experimental QES-512.
                  All passwords are stored encrypted and can only be decrypted with your master password.
                </p>
              </div>
            </div>
          </Alert>
          
          <Alert type="warning">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Important Security Notes</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• This is a demonstration tool - not for production use</li>
                  <li>• Use a strong, unique master password</li>
                  <li>• Consider using a real password manager for actual passwords</li>
                  <li>• QES-512 is experimental and not a real standard</li>
                </ul>
              </div>
            </div>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
