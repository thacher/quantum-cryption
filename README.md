# Quantum Cryption

> **Educational Crypto Demo** - Experimental QES-512 vs AES-256 Performance Analysis

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Educational-green?style=flat-square)](LICENSE)

A modern web application demonstrating experimental **QES (Quantum Encryption Standard, 512-bit equivalent)** alongside traditional AES-256. Built for research, education, and high-security workflow demonstrations.

## 🚀 Live Demo

**Local Development:** `http://localhost:3000`

> ⚠️ **Educational Use Only** - This demonstrates experimental cryptography concepts. QES-512 is not a real cryptographic standard.

## ✨ Features

### 🔐 Secure File Vault
- Drag-and-drop file encryption (up to 100MB)
- AES-256 vs QES-512 comparison
- Real-time performance metrics
- Download encrypted files

### 🔑 Password Manager Demo
- Browser-based encrypted vault
- Password strength analysis
- Entropy visualization
- Strong password generation

### 🎮 Crypto Playground
- Interactive learning environment
- Step-by-step encryption visualization
- Text entropy analysis
- Educational resources

### 🔄 Hybrid Encryption
- Multiple AES-256 rounds simulation
- Configurable layers (1-4)
- Performance impact analysis
- Security vs. speed trade-offs

### 📊 Performance Analysis
- Comprehensive benchmarking
- Quantum threat analysis
- Security level comparisons
- Throughput measurements

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
│   │   ├── page.tsx           # File Vault (main)
│   │   ├── password-manager/  # Password Manager demo
│   │   ├── playground/        # Crypto Playground
│   │   ├── hybrid/           # Hybrid Encryption demo
│   │   └── performance/      # Performance Analysis
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   └── layout.tsx        # Main layout
│   └── lib/                  # Core functionality
│       └── crypto/           # Encryption implementations
│           ├── aes256.ts     # AES-256 standard
│           ├── qes512.ts     # QES-512 experimental
│           ├── hybrid.ts     # Hybrid encryption
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

## 🔬 Algorithm Comparison

| Algorithm | Key Size | Quantum Resistance | Performance | Status |
|-----------|----------|-------------------|-------------|---------|
| **AES-256** | 256 bits | 128 bits | ⚡ Fast | ✅ Standard |
| **QES-512** | 512 bits | 256 bits | 🐌 Moderate | ⚠️ Experimental |
| **Hybrid (2L)** | 512 bits | 256 bits | 🐌 Slower | 📚 Educational |
| **Hybrid (3L)** | 768 bits | 384 bits | 🐌🐌 Much Slower | 📚 Educational |

## 📈 Performance Metrics

### Encryption Speed (1KB data)
- **AES-256:** ~2-5ms
- **QES-512:** ~8-15ms  
- **Hybrid (2L):** ~15-25ms
- **Hybrid (3L):** ~25-40ms

### Throughput
- **AES-256:** ~200-500 KB/s
- **QES-512:** ~100-200 KB/s
- **Hybrid:** ~50-150 KB/s (varies by layers)

## 🔒 Security Analysis

### Quantum Threat Assessment
- **AES-256:** Vulnerable to Grover's algorithm (128-bit effective)
- **QES-512:** Enhanced resistance (256-bit effective)
- **Hybrid:** Configurable resistance based on layers

### Brute Force Estimates
- **AES-256:** ~3.31 × 10⁶⁵ years (classical)
- **QES-512:** ~1.34 × 10¹⁵⁴ years (classical)
- **Quantum Impact:** ~50% reduction in effective key size

## 🎓 Educational Value

This project demonstrates:

- **Symmetric Encryption:** Block ciphers, key derivation, padding
- **Performance Trade-offs:** Security vs. speed considerations  
- **Quantum Computing Impact:** Grover's algorithm implications
- **Algorithm Design:** Layered encryption approaches
- **Security Analysis:** Entropy, complexity, threat modeling

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

## 🤝 Contributing

This is an educational project. Contributions welcome:

- 🐛 Bug fixes and improvements
- 📚 Additional educational content
- ⚡ Performance optimizations
- 🎨 UI/UX enhancements
- 📖 Documentation improvements

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
