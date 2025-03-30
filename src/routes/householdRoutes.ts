import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { FileFilterCallback } from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!') as any);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Temporary placeholder route handlers
// You'll replace these with the actual implementations later
const getHouseholds = (req: Request, res: Response) => {
  res.json({ message: 'Get all households' });
};

const getHousehold = (req: Request, res: Response) => {
  res.json({ message: `Get household with ID: ${req.params.id}` });
};

const createHousehold = (req: Request, res: Response) => {
  res.json({ message: 'Create new household', data: req.body });
};

const updateHousehold = (req: Request, res: Response) => {
  res.json({ message: `Update household with ID: ${req.params.id}`, data: req.body });
};

const deleteHousehold = (req: Request, res: Response) => {
  res.json({ message: `Delete household with ID: ${req.params.id}` });
};

const submitSurvey = (req: Request, res: Response) => {
  res.json({ 
    message: `Submit survey for household with ID: ${req.params.id}`,
    data: req.body,
    file: req.file 
  });
};

// Household routes
router.get('/', getHouseholds);
router.get('/:id', getHousehold);
router.post('/', createHousehold);
router.put('/:id', updateHousehold);
router.delete('/:id', deleteHousehold);

// Survey submission route (with file upload)
router.post('/:id/survey', upload.single('focalPointImage'), submitSurvey);

export default router;