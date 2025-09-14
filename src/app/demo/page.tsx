/**
 * QES-512 Demo - Simple demonstration of experimental quantum encryption
 */

'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  RotateCcw, 
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Input, Textarea, Alert, Badge } from '@/components/ui';
import { QES512 } from '@/lib/crypto/qes512';

export default function QES512Demo() {
  const [plaintext, setPlaintext] = useState('This is a test message for QES-512 demonstration.');
  const [password, setPassword] = useState('demo123');
  const [encryptedData, setEncryptedData] = useState<{
    ciphertext: string;
    iv: string;
    algorithm: string;
    keySize: number;
    blockSize: number;
    rounds: number;
    layers: number;
    encryptionTime: number;
    ciphertextSize: number;
    salt?: string;
  } | null>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const qes512 = new QES512();

  const encryptWithQES512 = async () => {
    if (!plaintext.trim() || !password.trim()) return;
    
    setIsEncrypting(true);
    try {
      const result = qes512.encrypt(plaintext, password);
      setEncryptedData({
        ciphertext: result.ciphertext,
        iv: result.iv,
        algorithm: result.algorithm,
        keySize: result.keySize,
        blockSize: result.blockSize,
        rounds: result.rounds,
        layers: result.layers || 2,
        encryptionTime: result.encryptionTime,
        ciphertextSize: result.ciphertextSize,
        salt: result.salt
      });
      setDecryptedText('');
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed. Please try again.');
    } finally {
      setIsEncrypting(false);
    }
  };

  const decryptWithQES512 = async () => {
    if (!encryptedData || !password.trim()) return;
    
    setIsDecrypting(true);
    try {
      const result = qes512.decrypt(encryptedData.ciphertext, password, encryptedData.iv, encryptedData.salt);
      setDecryptedText(result.plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Please check your password.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const clearAll = () => {
    setPlaintext('');
    setPassword('');
    setEncryptedData(null);
    setDecryptedText('');
  };

  return (
    <div className="space-y-6">
      {/* Educational Warning */}
      <div className="rounded-xl bg-warning-50 border border-warning-200 p-6 dark:bg-warning-900/20 dark:border-warning-800 animate-slide-up">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-warning-800 dark:text-white">⚠️ Educational Use Only</h3>
            <div className="mt-2 text-sm text-warning-700 dark:text-white">
              <p>This application demonstrates experimental QES (Quantum Encryption Standard) for research and educational purposes only. QES is not an officially recognized cryptographic standard. Do not use for production or real-world sensitive data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* QES-512 Configuration */}
      <Card title="QES-512 Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">512</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Key Size (bits)</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
            <div className="text-sm text-green-600 dark:text-green-400">Layers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">256</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Quantum Resistance (bits)</div>
          </div>
        </div>
      </Card>

      {/* Input Section */}
      <Card title="Input Data">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plaintext Message
            </label>
            <Textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter text to encrypt..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encryption Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
            />
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={encryptWithQES512}
              disabled={!plaintext.trim() || !password.trim() || isEncrypting}
              className="flex-1"
            >
              {isEncrypting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Encrypting...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt with QES-512
                </>
              )}
            </Button>
            <Button 
              onClick={clearAll}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Encrypted Data Display */}
      {encryptedData && (
        <Card title="Encrypted Data">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {encryptedData.encryptionTime.toFixed(2)}ms
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Encryption Time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {encryptedData.ciphertextSize}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Ciphertext Size</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {encryptedData.layers}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Layers</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {encryptedData.keySize}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Key Size (bits)</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciphertext
                </label>
                <Textarea
                  value={encryptedData.ciphertext}
                  readOnly
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IV (Initialization Vector)
                  </label>
                  <Input
                    value={encryptedData.iv}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salt
                  </label>
                  <Input
                    value={encryptedData.salt || 'N/A'}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={decryptWithQES512}
              disabled={!password.trim() || isDecrypting}
              className="w-full"
            >
              {isDecrypting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Decrypt with QES-512
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Decrypted Result */}
      {decryptedText && (
        <Card title="Decrypted Result">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="success">Successfully Decrypted</Badge>
              <Badge variant="info">{encryptedData?.algorithm}</Badge>
            </div>
            <Textarea
              value={decryptedText}
              readOnly
              rows={4}
              className="font-mono"
            />
          </div>
        </Card>
      )}

      {/* Algorithm Information */}
      <Card title="QES-512 Algorithm Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Technical Details</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>Algorithm:</strong> QES-512 (Experimental)</li>
                <li>• <strong>Key Size:</strong> 512 bits (simulated)</li>
                <li>• <strong>Block Size:</strong> 128 bits</li>
                <li>• <strong>Rounds:</strong> 28 (14 × 2 layers)</li>
                <li>• <strong>Layers:</strong> 2 AES-256 layers</li>
                <li>• <strong>Mode:</strong> CBC (Cipher Block Chaining)</li>
                <li>• <strong>Padding:</strong> PKCS7</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Security Features</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>Quantum Resistance:</strong> 256 bits</li>
                <li>• <strong>Classical Security:</strong> 512 bits</li>
                <li>• <strong>Key Derivation:</strong> PBKDF2</li>
                <li>• <strong>Salt Generation:</strong> Random 32 bytes</li>
                <li>• <strong>IV Generation:</strong> Random 16 bytes</li>
                <li>• <strong>Layered Approach:</strong> Enhanced security</li>
              </ul>
            </div>
          </div>
          
          <Alert variant="info">
            <div>
              <h4 className="font-medium">How QES-512 Works</h4>
              <p className="text-sm mt-1">
                QES-512 uses a layered approach with two AES-256 encryption rounds. 
                The first layer encrypts the plaintext, then the second layer encrypts the result. 
                This creates a simulated 512-bit equivalent security level for educational purposes.
              </p>
            </div>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
