async function importKey(keyHex: string): Promise<CryptoKey> {
  const bytes = keyHex.match(/.{1,2}/g);
  if (!bytes) throw new Error('Invalid encryption key format.');
  const rawKey = new Uint8Array(bytes.map(byte => parseInt(byte, 16)));
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate a random 128-bit symmetric key for AES-GCM
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Encrypt string data using AES-GCM
export async function encryptData(keyHex: string, dataText: string): Promise<string> {
  try {
    const cryptoKey = await importKey(keyHex);
    // Generate a 12-byte Initialization Vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(dataText);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encodedData
    );

    const ivHex = Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const ciphertextHex = Array.from(new Uint8Array(ciphertext))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return JSON.stringify({ iv: ivHex, ciphertext: ciphertextHex });
  } catch (err) {
    console.error('Encryption failed:', err);
    throw err;
  }
}

// Decrypt ciphertext using AES-GCM
export async function decryptData(keyHex: string, encryptedDataStr: string): Promise<string> {
  try {
    const { iv: ivHex, ciphertext: ciphertextHex } = JSON.parse(encryptedDataStr);
    if (!ivHex || !ciphertextHex) {
      throw new Error('Encrypted data structure is missing iv or ciphertext');
    }

    const cryptoKey = await importKey(keyHex);

    const ivBytes = ivHex.match(/.{1,2}/g);
    const cipherBytes = ciphertextHex.match(/.{1,2}/g);
    if (!ivBytes || !cipherBytes) throw new Error('Hex decoding failed');

    const iv = new Uint8Array(ivBytes.map((byte: string) => parseInt(byte, 16)));
    const ciphertext = new Uint8Array(cipherBytes.map((byte: string) => parseInt(byte, 16)));

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw err;
  }
}
