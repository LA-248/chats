import multer from 'multer';

export default function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size limit exceeded. Maximum file size allowed is 10MB.',
      });
    }
    // Handle other multer errors if needed
    return res.status(400).json({
      error: err.message,
    });
  }
  // For other types of errors, pass them to the next error handler
  next(err);
}
