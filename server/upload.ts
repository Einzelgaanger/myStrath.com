import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Configure storage for multer file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

/**
 * Setup file filter to restrict file types
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only certain file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "audio/mpeg",
    "audio/wav"
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

/**
 * Configure size limits
 */
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max file size
  files: 1, // Maximum 1 file per upload
};

/**
 * Setup file upload middleware
 */
export function setupFileUpload() {
  return multer({
    storage,
    fileFilter,
    limits,
  });
}

// Delete a file
export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Get file info
export function getFileInfo(filePath: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

// Create a directory
export function createDirectory(dirPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Delete a directory
export function deleteDirectory(dirPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rm(dirPath, { recursive: true, force: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// List files in a directory
export function listFiles(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// Check if a file exists
export function fileExists(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

// Check if a directory exists
export function directoryExists(dirPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(dirPath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

// Get file extension
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

// Get file name without extension
export function getFileNameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

// Get file size
export function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.size);
      }
    });
  });
}

// Get file creation time
export function getFileCreationTime(filePath: string): Promise<Date> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.birthtime);
      }
    });
  });
}

// Get file modification time
export function getFileModificationTime(filePath: string): Promise<Date> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.mtime);
      }
    });
  });
}

// Get file access time
export function getFileAccessTime(filePath: string): Promise<Date> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.atime);
      }
    });
  });
}

// Get file permissions
export function getFilePermissions(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.mode);
      }
    });
  });
}

// Set file permissions
export function setFilePermissions(filePath: string, mode: number): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.chmod(filePath, mode, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Get file owner
export function getFileOwner(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.uid);
      }
    });
  });
}

// Set file owner
export function setFileOwner(filePath: string, uid: number): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.chown(filePath, uid, -1, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Get file group
export function getFileGroup(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.gid);
      }
    });
  });
}

// Set file group
export function setFileGroup(filePath: string, gid: number): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.chown(filePath, -1, gid, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Copy a file
export function copyFile(srcPath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.copyFile(srcPath, destPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Move a file
export function moveFile(srcPath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rename(srcPath, destPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Read a file
export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Write a file
export function writeFile(filePath: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Append to a file
export function appendFile(filePath: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Read a file as a buffer
export function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Write a file from a buffer
export function writeFileFromBuffer(filePath: string, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Append to a file from a buffer
export function appendFileFromBuffer(filePath: string, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Create a read stream
export function createReadStream(filePath: string): fs.ReadStream {
  return fs.createReadStream(filePath);
}

// Create a write stream
export function createWriteStream(filePath: string): fs.WriteStream {
  return fs.createWriteStream(filePath);
}

// Create a read stream with options
export function createReadStreamWithOptions(
  filePath: string, 
  options: fs.ReadStreamOptions
): fs.ReadStream {
  return fs.createReadStream(filePath, options);
}

// Create a write stream with options
export function createWriteStreamWithOptions(
  filePath: string, 
  options: fs.WriteStreamOptions
): fs.WriteStream {
  return fs.createWriteStream(filePath, options);
}

// Watch a file
export function watchFile(
  filePath: string, 
  listener: (eventType: string, filename: string) => void
): fs.FSWatcher {
  return fs.watch(filePath, listener);
}

// Watch a directory
export function watchDirectory(
  dirPath: string, 
  listener: (eventType: string, filename: string) => void
): fs.FSWatcher {
  return fs.watch(dirPath, listener);
}

// Watch a file with options
export function watchFileWithOptions(
  filePath: string, 
  options: fs.WatchOptions, 
  listener: (eventType: string, filename: string) => void
): fs.FSWatcher {
  return fs.watch(filePath, options, listener);
}

// Watch a directory with options
export function watchDirectoryWithOptions(
  dirPath: string, 
  options: fs.WatchOptions, 
  listener: (eventType: string, filename: string) => void
): fs.FSWatcher {
  return fs.watch(dirPath, options, listener);
}

// Unwatch a file
export function unwatchFile(filePath: string): void {
  fs.unwatchFile(filePath);
}

// Unwatch a directory
export function unwatchDirectory(dirPath: string): void {
  fs.unwatchFile(dirPath);
}

// Get file stats
export function getFileStats(filePath: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

// Get file stats synchronously
export function getFileStatsSync(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

// Check if a path is a file
export function isFile(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.isFile());
      }
    });
  });
}

// Check if a path is a directory
export function isDirectory(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}

// Check if a path is a symbolic link
export function isSymbolicLink(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.lstat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.isSymbolicLink());
      }
    });
  });
}

// Check if a path is a file synchronously
export function isFileSync(filePath: string): boolean {
  return fs.statSync(filePath).isFile();
}

// Check if a path is a directory synchronously
export function isDirectorySync(filePath: string): boolean {
  return fs.statSync(filePath).isDirectory();
}

// Check if a path is a symbolic link synchronously
export function isSymbolicLinkSync(filePath: string): boolean {
  return fs.lstatSync(filePath).isSymbolicLink();
}

// Get file stats synchronously
export function getFileStatsSync(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

// Get file stats asynchronously
export function getFileStatsAsync(filePath: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

// Get file stats with options
export function getFileStatsWithOptions(
  filePath: string, 
  options: fs.StatOptions
): Promise<fs.Stats | fs.BigIntStats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, options, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

// Get file stats with options synchronously
export function getFileStatsWithOptionsSync(
  filePath: string, 
  options: fs.StatOptions
): fs.Stats | fs.BigIntStats {
  return fs.statSync(filePath, options);
}

// Get file stats with options asynchronously
export function getFileStatsWithOptionsAsync(
  filePath: string, 
  options: fs.StatOptions
): Promise<fs.Stats | fs.BigIntStats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, options, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

// Get file stats with options and callback
export function getFileStatsWithOptionsAndCallback(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): void {
  fs.stat(filePath, options, callback);
}

// Get file stats with options and callback synchronously
export function getFileStatsWithOptionsAndCallbackSync(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): void {
  try {
    const stats = fs.statSync(filePath, options);
    callback(null, stats);
  } catch (err) {
    callback(err as NodeJS.ErrnoException, null as any);
  }
}

// Get file stats with options and callback asynchronously
export function getFileStatsWithOptionsAndCallbackAsync(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): void {
  fs.stat(filePath, options, callback);
}

// Get file stats with options and callback and promise
export function getFileStatsWithOptionsAndCallbackAndPromise(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): Promise<fs.Stats | fs.BigIntStats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, options, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
      callback(err, stats);
    });
  });
}

// Get file stats with options and callback and promise synchronously
export function getFileStatsWithOptionsAndCallbackAndPromiseSync(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): Promise<fs.Stats | fs.BigIntStats> {
  return new Promise((resolve, reject) => {
    try {
      const stats = fs.statSync(filePath, options);
      resolve(stats);
      callback(null, stats);
    } catch (err) {
      reject(err);
      callback(err as NodeJS.ErrnoException, null as any);
    }
  });
}

// Get file stats with options and callback and promise asynchronously
export function getFileStatsWithOptionsAndCallbackAndPromiseAsync(
  filePath: string, 
  options: fs.StatOptions, 
  callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats | fs.BigIntStats) => void
): Promise<fs.Stats | fs.BigIntStats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, options, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
      callback(err, stats);
    });
  });
}