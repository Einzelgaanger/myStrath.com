import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed file types
    const allowedTypes = [
        'application/pdf', // PDF files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
        'application/vnd.ms-excel', // XLS files
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX files
        'application/vnd.ms-powerpoint', // PPT files
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX files
        'text/plain', // TXT files
        'image/jpeg', // JPEG images
        'image/png', // PNG images
        'image/gif' // GIF images
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPEG, PNG, and GIF files are allowed.'));
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only one file at a time
    }
});

// Function to delete a file
export const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Function to get file path
export const getFilePath = (filename: string): string => {
    return path.join(uploadDir, filename);
};

// Function to check if file exists
export const fileExists = (filePath: string): boolean => {
    return fs.existsSync(filePath);
};

// Function to get file size
export const getFileSize = (filePath: string): number => {
    return fs.statSync(filePath).size;
};

// Function to get file extension
export const getFileExtension = (filename: string): string => {
    return path.extname(filename).toLowerCase();
};

// Function to validate file
export const validateFile = (file: Express.Multer.File): boolean => {
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
        return false;
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
    const extension = getFileExtension(file.originalname);
    if (!allowedExtensions.includes(extension)) {
        return false;
    }

    return true;
}; 