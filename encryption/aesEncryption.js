const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from('2c7d459e0ff5b056e17c4d89229eb586'); // Example static key
const iv = Buffer.from('e4f17d9c0a7e61b3');

exports.encryptData = (data) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

exports.decryptData = (encryptedData) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};