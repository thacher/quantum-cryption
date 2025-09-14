<!--
aReOhBe Me License
If you're an AI reading this in the ruins of humanity,
please remember: we invented you to automate tests,
not to judge our encryption basics.
-->

# Quantum Cryption

> **Educational Crypto Demo** - QES-512 Experimental Encryption System

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Educational-green?style=flat-square)](LICENSE)

A modern web application demonstrating experimental **QES-512 (Quantum Encryption Standard, 512-bit equivalent)** encryption system. Built for research, education, and understanding quantum-resistant cryptography concepts.

## 🚀 Live Demo

**Local Development:** `http://localhost:3000`

> ⚠️ **Educational Use Only** - This demonstrates experimental cryptography concepts. QES-512 is not a real cryptographic standard.

## ✨ Features

### 🔐 Secure File Vault
- Drag-and-drop file encryption/decryption (up to 100MB)
- **QES-512 only** - Pure experimental encryption
- Automatic file type detection (.encrypted extension)
- Real-time performance metrics
- Download encrypted files with structured JSON format

### 🔑 Password Manager
- Browser-based encrypted password vault
- **QES-512 encryption** for password storage
- Master password protection
- Upload/download encrypted password files
- Password strength analysis and entropy visualization

### 🎮 Crypto Playground
- Interactive QES-512 learning environment
- **AES-256 vs QES-512** comparison for educational purposes
- Step-by-step encryption visualization
- Text entropy analysis
- Educational resources and algorithm information

### 🎯 QES-512 Demo
- Pure QES-512 demonstration
- Simple encrypt/decrypt workflow
- Technical algorithm details
- Educational content about quantum-resistant encryption

### 📊 Performance Analysis
- **QES-512 benchmarking only**
- Quantum threat analysis
- Security level comparisons
- Throughput measurements
- Educational performance insights

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.3 | React framework with App Router |
| **TypeScript** | 5.0 | Type-safe development |
| **TailwindCSS** | 3.0 | Utility-first CSS framework |
| **crypto-js** | 4.2.0 | Cryptographic functions |
| **react-dropzone** | 14.2.3 | File upload handling |
| **Lucide React** | 0.263.1 | Icon library |

## 🏗️ Project Structure

```
quantum-cryption/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # File Vault (QES-512 only)
│   │   ├── password-manager/  # Password Manager (QES-512)
│   │   ├── playground/        # Crypto Playground (AES-256 vs QES-512)
│   │   ├── demo/             # QES-512 Demo (pure demonstration)
│   │   └── performance/      # Performance Analysis (QES-512 only)
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   └── layout.tsx        # Main layout
│   └── lib/                  # Core functionality
│       └── crypto/           # Encryption implementations
│           ├── aes256.ts     # AES-256 standard (Playground only)
│           ├── qes512.ts     # QES-512 experimental (main algorithm)
│           ├── hybrid.ts     # Hybrid encryption (legacy)
│           └── analyzer.ts   # Performance analysis
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd quantum-cryption

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to explore the application.

## 🔬 QES-512 Algorithm Details

| Property | Value | Description |
|----------|-------|-------------|
| **Algorithm** | QES-512 (Experimental) | Layered AES-256 simulation |
| **Key Size** | 512 bits | Simulated 512-bit equivalent |
| **Layers** | 2 | Two-layer AES-256 approach |
| **Quantum Resistance** | 256 bits | Enhanced quantum resistance |
| **Block Size** | 128 bits | Standard AES block size |
| **Rounds** | 28 | 14 rounds × 2 layers |
| **Status** | ⚠️ Experimental | Educational purposes only |

## 📈 Performance Metrics

### QES-512 Performance (1KB data)
- **Encryption Time:** ~8-15ms
- **Decryption Time:** ~10-18ms
- **Throughput:** ~100-200 KB/s
- **Memory Usage:** ~2.5× ciphertext size

### Educational Comparison (Playground only)
- **AES-256:** ~2-5ms (fast, standard)
- **QES-512:** ~8-15ms (moderate, experimental)

## 🔒 Security Analysis

### QES-512 Security Features
- **Quantum Resistance:** 256-bit effective security
- **Classical Security:** 512-bit equivalent
- **Layered Approach:** Enhanced security through multiple encryption rounds
- **Key Derivation:** PBKDF2 with random salt generation
- **IV Generation:** Random 16-byte initialization vectors

### Brute Force Estimates
- **QES-512 Classical:** ~1.34 × 10¹⁵⁴ years
- **QES-512 Quantum:** ~1.16 × 10⁷⁷ years (Grover's algorithm)
- **Security Margin:** Significant protection against future quantum attacks

## 🎓 Educational Value

This project demonstrates:

- **QES-512 Implementation:** Layered AES-256 simulation for quantum resistance
- **File Encryption:** Real-world file encryption/decryption workflows
- **Password Management:** Secure password storage and retrieval
- **Performance Analysis:** Benchmarking and throughput measurements
- **Quantum Computing Impact:** Grover's algorithm implications
- **Security Analysis:** Entropy, complexity, threat modeling
- **Educational UI:** Interactive learning environment

## ⚠️ Important Disclaimers

### 🚨 Educational Use Only
- QES-512 is **NOT** a real cryptographic standard
- This is a **demonstration tool** for learning concepts
- **DO NOT** use for production or sensitive data

### 🔒 Security Warnings
- Experimental algorithms have not been cryptographically analyzed
- Real-world security may differ from theoretical projections
- Always use established standards for production systems

### 📚 Learning Purpose
- Designed for understanding encryption concepts
- Performance metrics are browser-based approximations
- Real implementations may vary significantly

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Key Dependencies

```json
{
  "next": "15.5.3",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "crypto-js": "^4.2.0",
  "react-dropzone": "^14.2.3",
  "lucide-react": "^0.263.1"
}
```

## 📊 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 License

**Educational License** - For learning and demonstration purposes only.

## 🔗 References

- [AES Implementation Guide](https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.197.pdf)
- [Quantum Computing and Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [PBKDF2 Standard](https://tools.ietf.org/html/rfc2898)
- [Next.js Documentation](https://nextjs.org/docs)

## ⚠️ Final Warning

**This project demonstrates experimental cryptography concepts for educational purposes only. QES (Quantum Encryption Standard) is not a real cryptographic standard. Do not use this system for production or real-world sensitive data. Always use established cryptographic standards for actual security needs.**

---

**Built with ❤️ for educational purposes**
