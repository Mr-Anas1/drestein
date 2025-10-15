/**
 * CCAvenue AES Encryption/Decryption
 * 
 * Per CCAvenue API documentation:
 * - Encryption key is mapped to Access Code in M.A.R.S
 * - Default: AES-128-CBC with MD5-derived key
 * - IV: 16 zero bytes (standard for CCAvenue)
 * - Input: UTF-8 string, Output: Hex string
 */

const crypto = require('crypto');

/**
 * Get AES algorithm and key derivation method from env
 */
function getConfig() {
  const mode = process.env.CCAVENUE_AES_MODE || 'aes-128-cbc';
  const workingKey = process.env.CCAVENUE_WORKING_KEY;
  
  if (!workingKey) {
    throw new Error('CCAVENUE_WORKING_KEY is required');
  }

  return { mode, workingKey };
}

/**
 * Derive encryption key from working key
 * @param {string} workingKey - Working key from CCAvenue
 * @param {string} mode - AES mode (aes-128-cbc or aes-256-cbc)
 * @returns {Buffer} - Derived key
 */
function deriveKey(workingKey, mode) {
  if (mode === 'aes-128-cbc') {
    // AES-128 requires 16-byte key - use MD5 hash of working key
    return crypto.createHash('md5').update(workingKey, 'utf8').digest();
  } else if (mode === 'aes-256-cbc') {
    // AES-256 requires 32-byte key - use SHA-256 hash of working key
    return crypto.createHash('sha256').update(workingKey, 'utf8').digest();
  }
  throw new Error(`Unsupported AES mode: ${mode}`);
}

/**
 * Encrypt plaintext for CCAvenue
 * @param {string} plainText - Plain text to encrypt
 * @returns {string} - Hex-encoded encrypted string
 */
function encryptRequest(plainText) {
  try {
    const { mode, workingKey } = getConfig();
    const key = deriveKey(workingKey, mode);
    const iv = Buffer.alloc(16, 0); // 16 zero bytes as per CCAvenue standard
    
    const cipher = crypto.createCipheriv(mode, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('[CCAvenue Crypto] Encryption failed:', error.message);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt response from CCAvenue
 * @param {string} encryptedHex - Hex-encoded encrypted string
 * @returns {string} - Decrypted plain text
 */
function decryptResponse(encryptedHex) {
  try {
    const { mode, workingKey } = getConfig();
    const key = deriveKey(workingKey, mode);
    const iv = Buffer.alloc(16, 0); // 16 zero bytes as per CCAvenue standard
    
    const decipher = crypto.createDecipheriv(mode, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[CCAvenue Crypto] Decryption failed:', error.message);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Test encryption/decryption round-trip
 * @param {string} testString - Test string
 * @returns {boolean} - True if round-trip successful
 */
function testRoundTrip(testString = 'test_payload_123') {
  try {
    const encrypted = encryptRequest(testString);
    const decrypted = decryptResponse(encrypted);
    return decrypted === testString;
  } catch (error) {
    console.error('[CCAvenue Crypto] Round-trip test failed:', error.message);
    return false;
  }
}

module.exports = {
  encryptRequest,
  decryptResponse,
  testRoundTrip,
  deriveKey, // Export for testing
};
