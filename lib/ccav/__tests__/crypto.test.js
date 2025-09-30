/**
 * Unit tests for CCAvenue encryption/decryption
 */

const crypto = require('crypto');

// Mock environment variables
process.env.CCAVENUE_WORKING_KEY = '92C4125E3E77DE78741C507A54BF57E7';
process.env.CCAVENUE_AES_MODE = 'aes-128-cbc';

const { encryptRequest, decryptResponse, testRoundTrip, deriveKey } = require('../crypto');

describe('CCAvenue Crypto', () => {
  describe('Key Derivation', () => {
    test('should derive 16-byte key for AES-128-CBC using MD5', () => {
      const workingKey = '92C4125E3E77DE78741C507A54BF57E7';
      const key = deriveKey(workingKey, 'aes-128-cbc');
      
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(16); // 128 bits = 16 bytes
      
      // Verify it's MD5 hash
      const expectedKey = crypto.createHash('md5').update(workingKey, 'utf8').digest();
      expect(key.equals(expectedKey)).toBe(true);
    });

    test('should derive 32-byte key for AES-256-CBC using SHA-256', () => {
      const workingKey = '92C4125E3E77DE78741C507A54BF57E7';
      const key = deriveKey(workingKey, 'aes-256-cbc');
      
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits = 32 bytes
      
      // Verify it's SHA-256 hash
      const expectedKey = crypto.createHash('sha256').update(workingKey, 'utf8').digest();
      expect(key.equals(expectedKey)).toBe(true);
    });

    test('should throw error for unsupported mode', () => {
      expect(() => {
        deriveKey('test', 'aes-192-cbc');
      }).toThrow('Unsupported AES mode');
    });
  });

  describe('Encryption', () => {
    test('should encrypt plaintext to hex string', () => {
      const plainText = 'merchant_id=123&order_no=456&amount=250.00';
      const encrypted = encryptRequest(plainText);
      
      expect(typeof encrypted).toBe('string');
      expect(encrypted).toMatch(/^[0-9a-f]+$/); // hex string
      expect(encrypted.length).toBeGreaterThan(0);
    });

    test('should produce consistent encryption for same input', () => {
      const plainText = 'test_payload';
      const encrypted1 = encryptRequest(plainText);
      const encrypted2 = encryptRequest(plainText);
      
      // With zero IV, same input should produce same output
      expect(encrypted1).toBe(encrypted2);
    });

    test('should throw error if CCAVENUE_WORKING_KEY is missing', () => {
      const originalKey = process.env.CCAVENUE_WORKING_KEY;
      delete process.env.CCAVENUE_WORKING_KEY;
      
      expect(() => {
        encryptRequest('test');
      }).toThrow('CCAVENUE_WORKING_KEY is required');
      
      process.env.CCAVENUE_WORKING_KEY = originalKey;
    });
  });

  describe('Decryption', () => {
    test('should decrypt encrypted hex string back to plaintext', () => {
      const plainText = 'merchant_id=123&order_no=456&amount=250.00';
      const encrypted = encryptRequest(plainText);
      const decrypted = decryptResponse(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    test('should handle special characters', () => {
      const plainText = 'name=Test User&email=test@example.com&amount=250.00&currency=INR';
      const encrypted = encryptRequest(plainText);
      const decrypted = decryptResponse(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    test('should throw error for invalid encrypted data', () => {
      expect(() => {
        decryptResponse('invalid_hex_string');
      }).toThrow();
    });
  });

  describe('Round-trip Tests', () => {
    test('should successfully round-trip encrypt and decrypt', () => {
      const result = testRoundTrip('test_payload_123');
      expect(result).toBe(true);
    });

    test('should handle empty string', () => {
      const plainText = '';
      const encrypted = encryptRequest(plainText);
      const decrypted = decryptResponse(encrypted);
      expect(decrypted).toBe(plainText);
    });

    test('should handle long strings', () => {
      const plainText = 'a'.repeat(1000);
      const encrypted = encryptRequest(plainText);
      const decrypted = decryptResponse(encrypted);
      expect(decrypted).toBe(plainText);
    });

    test('should handle URL-encoded parameters', () => {
      const plainText = 'merchant_id=2831331&order_no=17591238259023078&amount=250.00&currency=INR&redirect_url=https://drestein.vercel.app/callback&cancel_url=https://drestein.vercel.app/callback&language=EN';
      const encrypted = encryptRequest(plainText);
      const decrypted = decryptResponse(encrypted);
      expect(decrypted).toBe(plainText);
    });
  });

  describe('CCAvenue Sample Vectors', () => {
    test('should match CCAvenue encryption format', () => {
      // Test that our encryption produces valid CCAvenue format
      const plainText = 'merchant_id=2831331&order_no=TEST123&amount=250.00';
      const encrypted = encryptRequest(plainText);
      
      // Should be hex string
      expect(encrypted).toMatch(/^[0-9a-f]+$/);
      
      // Should be decrytable
      const decrypted = decryptResponse(encrypted);
      expect(decrypted).toBe(plainText);
    });

    // If CCAvenue provides sample enc_request in documentation, add test here
    // test('should match CCAvenue sample enc_request', () => {
    //   const samplePlainText = '...'; // from PDF
    //   const expectedEncrypted = '...'; // from PDF
    //   const encrypted = encryptRequest(samplePlainText);
    //   expect(encrypted).toBe(expectedEncrypted);
    // });
  });
});
