import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { allowedMimeTypes } from '../config/constants';

const ApplicationFormUploadDir = path.join(__dirname, '..', 'uploads', 'Application Form');
const BulkMailUploadDir = path.join(__dirname, '..', 'uploads', 'Bulk Mail');

if (!fs.existsSync(BulkMailUploadDir)) {
    fs.mkdirSync(BulkMailUploadDir, { recursive: true });
}

// Ensure the folder exists before using it
if (!fs.existsSync(ApplicationFormUploadDir)) {
    fs.mkdirSync(ApplicationFormUploadDir, { recursive: true });
}

export const fileFilter = (req: any, file: any, callback: any) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

export const ApplicationFormStorage = diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, ApplicationFormUploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        const uniqueString = generateUniqueFileName(name, ext);
        cb(null, uniqueString);
    },
});

export const BulkMailStorage = diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, BulkMailUploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        const uniqueString = generateUniqueFileName(name, ext);
        cb(null, uniqueString);
    }
})


const generateUniqueFileName = (filename: string, extension: string): string => {
    const uniqueString = randomBytes(16).toString('hex');
    return `${uniqueString}.${filename}-${Date.now()}${extension}`;
};

