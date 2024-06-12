import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

export function encrypt(text: string | null | undefined) {
	if (!text) return null; // Or any default value you prefer

	const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

export function decrypt(text: any) {
	if (!text) return null;
	let iv = Buffer.from(text.iv, 'hex');
	let encryptedText = Buffer.from(text.encryptedData, 'hex');
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	const decryptedString = decrypted.toString();

	// Try to parse as JSON, otherwise return the raw string
	try {
		const parsedJson = JSON.parse(decryptedString);
		return parsedJson;
	} catch (error) {
		console.error('Error parsing decrypted data as JSON:', error);
		return decryptedString;
	}
}
