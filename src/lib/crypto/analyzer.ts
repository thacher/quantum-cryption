/**
 * Performance metrics and quantum threat analysis utilities
 */

export interface PerformanceMetrics {
  encryptionTime: number;
  decryptionTime: number;
  throughput: number; // bytes per second
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface QuantumThreatAnalysis {
  algorithm: string;
  classicalBits: number;
  quantumBits: number;
  classicalComplexity: number;
  quantumComplexity: number;
  bruteForceTime: string;
  quantumBruteForceTime: string;
  quantumResistance: 'Low' | 'Medium' | 'High' | 'Very High';
  recommendations: string[];
}

export interface SecurityComparison {
  aes256: QuantumThreatAnalysis;
  qes512: QuantumThreatAnalysis;
  hybrid: QuantumThreatAnalysis;
}

export class CryptoAnalyzer {
  /**
   * Calculate performance metrics for encryption operations
   */
  static calculatePerformanceMetrics(
    dataSize: number,
    encryptionTime: number,
    decryptionTime: number
  ): PerformanceMetrics {
    return {
      encryptionTime,
      decryptionTime,
      throughput: dataSize / (encryptionTime / 1000), // bytes per second
    };
  }

  /**
   * Analyze quantum threat resistance for different algorithms
   */
  static analyzeQuantumThreat(
    algorithm: string,
    classicalBits: number,
    quantumBits: number
  ): QuantumThreatAnalysis {
    const classicalComplexity = Math.pow(2, classicalBits);
    const quantumComplexity = Math.pow(2, quantumBits);
    
    const bruteForceTime = this.calculateBruteForceTime(classicalBits);
    const quantumBruteForceTime = this.calculateBruteForceTime(quantumBits);
    
    const quantumResistance = this.determineQuantumResistance(quantumBits);
    const recommendations = this.generateRecommendations(algorithm, quantumBits, quantumResistance);
    
    return {
      algorithm,
      classicalBits,
      quantumBits,
      classicalComplexity,
      quantumComplexity,
      bruteForceTime,
      quantumBruteForceTime,
      quantumResistance,
      recommendations
    };
  }

  /**
   * Compare security levels of different algorithms
   */
  static compareSecurityLevels(): SecurityComparison {
    return {
      aes256: this.analyzeQuantumThreat('AES-256', 256, 128),
      qes512: this.analyzeQuantumThreat('QES-512 (Experimental)', 512, 256),
      hybrid: this.analyzeQuantumThreat('Hybrid AES-256 (2 layers)', 512, 256)
    };
  }

  /**
   * Calculate entropy of a string
   */
  static calculateEntropy(text: string): number {
    const charCounts: { [key: string]: number } = {};
    
    // Count character frequencies
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    
    // Calculate entropy using Shannon's formula
    const length = text.length;
    let entropy = 0;
    
    for (const count of Object.values(charCounts)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  /**
   * Generate entropy visualization data
   */
  static generateEntropyVisualization(text: string): {
    entropy: number;
    maxEntropy: number;
    percentage: number;
    characterDistribution: { [key: string]: number };
  } {
    const entropy = this.calculateEntropy(text);
    const maxEntropy = Math.log2(new Set(text).size);
    const percentage = (entropy / maxEntropy) * 100;
    
    const charCounts: { [key: string]: number } = {};
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    
    return {
      entropy,
      maxEntropy,
      percentage,
      characterDistribution: charCounts
    };
  }

  /**
   * Calculate brute force time for given bit strength
   */
  private static calculateBruteForceTime(bits: number): string {
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
   * Determine quantum resistance level
   */
  private static determineQuantumResistance(quantumBits: number): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (quantumBits < 128) return 'Low';
    if (quantumBits < 192) return 'Medium';
    if (quantumBits < 256) return 'High';
    return 'Very High';
  }

  /**
   * Generate security recommendations
   */
  private static generateRecommendations(
    algorithm: string,
    quantumBits: number,
    resistance: 'Low' | 'Medium' | 'High' | 'Very High'
  ): string[] {
    const recommendations: string[] = [];
    
    if (resistance === 'Low') {
      recommendations.push('Consider upgrading to a quantum-resistant algorithm');
      recommendations.push('Use longer key lengths if possible');
    } else if (resistance === 'Medium') {
      recommendations.push('Monitor quantum computing developments');
      recommendations.push('Consider hybrid approaches for critical data');
    } else if (resistance === 'High') {
      recommendations.push('Good quantum resistance for current threats');
      recommendations.push('Regular security audits recommended');
    } else {
      recommendations.push('Excellent quantum resistance');
      recommendations.push('Suitable for long-term data protection');
    }
    
    if (algorithm.includes('Experimental')) {
      recommendations.push('⚠️ Experimental algorithm - not recommended for production');
    }
    
    return recommendations;
  }

  /**
   * Format large numbers for display
   */
  static formatLargeNumber(num: number): string {
    if (num >= 1e18) return `${(num / 1e18).toFixed(2)} × 10¹⁸`;
    if (num >= 1e15) return `${(num / 1e15).toFixed(2)} × 10¹⁵`;
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} × 10¹²`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} × 10⁹`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} × 10⁶`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)} × 10³`;
    return num.toString();
  }

  /**
   * Calculate throughput in human-readable format
   */
  static formatThroughput(bytesPerSecond: number): string {
    if (bytesPerSecond >= 1e9) return `${(bytesPerSecond / 1e9).toFixed(2)} GB/s`;
    if (bytesPerSecond >= 1e6) return `${(bytesPerSecond / 1e6).toFixed(2)} MB/s`;
    if (bytesPerSecond >= 1e3) return `${(bytesPerSecond / 1e3).toFixed(2)} KB/s`;
    return `${bytesPerSecond.toFixed(2)} B/s`;
  }
}
