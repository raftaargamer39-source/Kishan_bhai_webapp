/**
 * Firebase Cloud Storage Integration Service for Kishan Bhai
 * Handles secure file uploads (Crop leaf images, Soil reports, Farmer ID documents, Mandi receipts)
 * to the production Firebase Storage bucket: kishan-bhai-a1c8d.firebasestorage.app
 */

import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { storage, auth } from '../firebase';

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface UploadProgressCallback {
  (progressPercent: number, bytesTransferred: number, totalBytes: number): void;
}

/**
 * Upload a File or Blob directly to Firebase Storage bucket
 */
export async function uploadFileToStorage(
  file: File | Blob,
  folder: string = 'uploads',
  customFileNameOrProgress?: string | UploadProgressCallback,
  onProgressCallback?: UploadProgressCallback
): Promise<UploadResult> {
  const customFileName = typeof customFileNameOrProgress === 'string' ? customFileNameOrProgress : undefined;
  const onProgress = typeof customFileNameOrProgress === 'function' ? customFileNameOrProgress : onProgressCallback;

  const user = auth.currentUser;
  const userId = user?.uid || 'guest';
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const timestamp = Date.now();
  
  let originalName = 'file';
  let mimeType = file.type || 'application/octet-stream';

  if (file instanceof File) {
    originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const finalFileName = customFileName || `${timestamp}_${originalName}`;
  const storagePath = `${cleanFolder}/${userId}/${finalFileName}`;
  const fileRef = ref(storage, storagePath);

  const metadata = {
    contentType: mimeType,
    customMetadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      platform: 'kishan-bhai-web',
    },
  };

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.error('[Firebase Storage] Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`[Firebase Storage] Upload complete: ${storagePath}`);
          resolve({
            downloadUrl,
            storagePath,
            fileName: finalFileName,
            size: uploadTask.snapshot.totalBytes,
            contentType: mimeType,
            uploadedAt: new Date().toISOString(),
          });
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Upload Base64 or Data URL image directly to Firebase Storage bucket
 */
export async function uploadBase64ImageToStorage(
  base64Data: string,
  folder: string = 'disease-scans',
  fileNamePrefix: string = 'leaf_scan'
): Promise<UploadResult> {
  const user = auth.currentUser;
  const userId = user?.uid || 'guest';
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const timestamp = Date.now();
  const finalFileName = `${fileNamePrefix}_${timestamp}.jpg`;
  const storagePath = `${cleanFolder}/${userId}/${finalFileName}`;
  const fileRef = ref(storage, storagePath);

  // If it's a data url, strip or extract format
  let format: 'data_url' | 'base64' = 'base64';
  let cleanData = base64Data;
  let contentType = 'image/jpeg';

  if (base64Data.startsWith('data:')) {
    format = 'data_url';
    const match = base64Data.match(/^data:([^;]+);/);
    if (match) {
      contentType = match[1];
    }
  }

  const metadata = {
    contentType,
    customMetadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      source: 'crop-pathology-scanner',
    },
  };

  const uploadTask = await uploadString(fileRef, cleanData, format, metadata);
  const downloadUrl = await getDownloadURL(uploadTask.ref);

  console.log(`[Firebase Storage] Base64 image uploaded: ${storagePath}`);

  return {
    downloadUrl,
    storagePath,
    fileName: finalFileName,
    size: uploadTask.metadata.size || 0,
    contentType,
    uploadedAt: new Date().toISOString(),
  };
}
