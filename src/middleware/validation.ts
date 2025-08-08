import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

export const validateText = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { text } = req.body;
  const errors: ValidationError[] = [];

  // Check if text exists and is a string
  if (!text) {
    errors.push({
      field: 'text',
      message: 'Text is required',
    });
  } else if (typeof text !== 'string') {
    errors.push({
      field: 'text',
      message: 'Text must be a string',
    });
  } else if (text.trim().length === 0) {
    errors.push({
      field: 'text',
      message: 'Text cannot be empty',
    });
  } else if (text.length > 100000) {
    // Limit text size to prevent abuse
    errors.push({
      field: 'text',
      message: 'Text is too long (maximum 100,000 characters)',
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};
