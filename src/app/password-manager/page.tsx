/**
 * Quantum-Resistant Password Manager Demo
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
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Input, Alert, Badge, ProgressBar } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';
import { AES256 } from '@/lib/crypto/aes256';
import { CryptoAnalyzer } from '@/lib/crypto/analyzer';

interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  website: string;
  encrypted?: string;
  iv?: string;
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
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'aes256' | 'qes512'>('qes512');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [entropyAnalysis, setEntropyAnalysis] = useState<any>(null);

  const qes512 = new QES512();
  const aes256 = new AES256();

  const addEntry = () => {
    if (!newEntry.name || !newEntry.username || !newEntry.password) return;

    const entry: PasswordEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setEntries(prev => [...prev, entry]);
    setNewEntry({ name: '', username: '', password: '', website: '' });
  };

  const encryptVault = async () => {
    if (!masterPassword || entries.length === 0) return;

    const vaultData = JSON.stringify(entries);
    let result;
    
    if (selectedAlgorithm === 'qes512') {
      result = qes512.encrypt(vaultData, masterPassword);
    } else {
      result = aes256.encrypt(vaultData, masterPassword);
    }

    // Update entries with encrypted data
    setEntries(prev => prev.map(entry => ({
      ...entry,
      encrypted: result.ciphertext,
      iv: result.iv,
      algorithm: result.algorithm
    })));

    setIsEncrypted(true);
  };

  const decryptVault = async () => {
    if (!masterPassword || !isEncrypted) return;

    try {
      const firstEntry = entries.find(e => e.encrypted);
      if (!firstEntry?.encrypted || !firstEntry?.iv) return;

      let result;
      if (firstEntry.algorithm?.includes('QES-512')) {
        result = qes512.decrypt(firstEntry.encrypted, masterPassword, firstEntry.iv);
      } else {
        result = aes256.decrypt(firstEntry.encrypted, masterPassword, firstEntry.iv);
      }

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

  const analyzePasswordEntropy = (password: string) => {
    const analysis = CryptoAnalyzer.generateEntropyVisualization(password);
    setEntropyAnalysis(analysis);
  };

  const generateStrongPassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewEntry(prev => ({ ...prev, password }));
    analyzePasswordEntropy(password);
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quantum-Resistant Password Manager</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Secure password storage using AES-256 or experimental QES-512
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

      {/* Master Password */}
      <Card title="Master Password">
        <div className="max-w-md space-y-4">
          <Input
            type="password"
            label="Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter master password"
          />
          <div className="flex space-x-2">
            <Button
              onClick={encryptVault}
              disabled={!masterPassword || entries.length === 0 || isEncrypted}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Encrypt Vault
            </Button>
            <Button
              onClick={decryptVault}
              variant="secondary"
              disabled={!masterPassword || !isEncrypted}
              className="flex-1"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Decrypt Vault
            </Button>
          </div>
        </div>
      </Card>

      {/* Add New Entry */}
      <Card title="Add New Password Entry">
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
            <div className="flex space-x-2">
              <Input
                label="Password"
                type="password"
                value={newEntry.password}
                onChange={(e) => {
                  setNewEntry(prev => ({ ...prev, password: e.target.value }));
                  analyzePasswordEntropy(e.target.value);
                }}
                placeholder="Enter password"
                className="flex-1"
              />
              <Button
                onClick={generateStrongPassword}
                variant="secondary"
                className="mt-6"
              >
                Generate
              </Button>
            </div>
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
        <div className="mt-4">
          <Button onClick={addEntry} disabled={!newEntry.name || !newEntry.username || !newEntry.password}>
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
                  Your password vault is encrypted using {selectedAlgorithm === 'qes512' ? 'experimental QES-512' : 'standard AES-256'}.
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
