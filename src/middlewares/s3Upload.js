// middlewares/s3Upload.js
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');

// Version compatibility check
try {
  console.log("🔍 Checking multer-s3 version...");
  const packageJson = JSON.parse(fs.readFileSync('./node_modules/multer-s3/package.json', 'utf8'));
  const version = packageJson.version;
  const majorVersion = parseInt(version.split('.')[0], 10);
  
  console.log(`📦 multer-s3 version: ${version}`);
  
  if (majorVersion >= 3) {
    console.error('⚠️ WARNING: You are using multer-s3 version 3.x which requires AWS SDK v3');
    console.error('⚠️ However, your application is configured to use AWS SDK v2');
    console.error('⚠️ This version mismatch may cause compatibility issues');
    console.error('⚠️ Consider downgrading to multer-s3@2.10.0 which works with AWS SDK v2');
  } else {
    console.log('✅ Using multer-s3 version 2.x which is compatible with AWS SDK v2');
  }
} catch (err) {
  console.warn("⚠️ Could not check multer-s3 version:", err.message);
}

// Check for AWS SDK v3 presence
try {
  console.log("🔍 Checking for AWS SDK v3...");
  if (fs.existsSync('./node_modules/@aws-sdk')) {
    const modules = fs.readdirSync('./node_modules/@aws-sdk')
      .filter(dir => fs.statSync(`./node_modules/@aws-sdk/${dir}`).isDirectory());
    
    if (modules.length > 0) {
      console.warn("⚠️ Found AWS SDK v3 modules:", modules.join(', '));
      console.warn("⚠️ Having both AWS SDK v2 and v3 installed can cause conflicts");
    } else {
      console.log("✅ No AWS SDK v3 modules found");
    }
  } else {
    console.log("✅ No AWS SDK v3 detected");
  }
} catch (err) {
  console.warn("⚠️ Could not check for AWS SDK v3:", err.message);
}

// Configure AWS SDK
console.log("🔧 Configuring AWS SDK v2...");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-north-1'
});

// Create S3 service object
const s3 = new AWS.S3();
console.log("✅ S3 client created:", typeof s3, s3.constructor.name);

// Test S3 connection and bucket access
console.log("🔄 Testing S3 connection...");
s3.listBuckets((err, data) => {
  if (err) {
    console.error("❌ S3 Connection Error:", err);
    return;
  }
  
  console.log("✅ S3 Connection Successful!");
  const bucketNames = data.Buckets.map(b => b.Name);
  console.log("📁 Available buckets:", bucketNames.join(', '));
  
  const targetBucket = process.env.S3_BUCKET_NAME;
  if (bucketNames.includes(targetBucket)) {
    console.log(`✅ Target bucket '${targetBucket}' exists`);
    
    // Test write permissions by attempting to list objects
    console.log(`🔄 Testing permissions on bucket '${targetBucket}'...`);
    s3.listObjects({ Bucket: targetBucket, MaxKeys: 1 }, (err, data) => {
      if (err) {
        console.error(`❌ Cannot access bucket '${targetBucket}':`, err.message);
      } else {
        console.log(`✅ Successfully accessed bucket '${targetBucket}'`);
      }
    });
  } else {
    console.error(`❌ Target bucket '${targetBucket}' NOT FOUND among available buckets!`);
  }
});

// Try to detect if we're running multer-s3 v3 with AWS SDK v2
let isMulterS3V3 = false;
try {
  // This would only exist in multer-s3 v3
  if (multerS3.default && typeof multerS3.default === 'function') {
    isMulterS3V3 = true;
    console.error('❌ CRITICAL ERROR: Detected multer-s3 v3 usage pattern with AWS SDK v2!');
    console.error('❌ This will cause "client.send is not a function" errors');
    console.error('❌ Please downgrade to multer-s3@2.10.0 using: npm install multer-s3@2.10.0');
  }
} catch (err) {
  console.warn("⚠️ Could not perform multer-s3 version compatibility check:", err.message);
}

// Configure S3 upload with comprehensive error handling
let storage;
try {
  storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    // acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function(req, file, cb) {
      console.log(`📄 Processing file metadata: ${file.originalname}`);
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const key = `uploads/${file.fieldname}-${uniqueSuffix}${ext}`;
      console.log(`🔑 Generated key for upload: ${key}`);
      cb(null, key);
    }
  });
  
  console.log("✅ S3 storage configuration created successfully");
} catch (err) {
  console.error("❌ Failed to create S3 storage configuration:", err);
  console.error("❌ This might indicate a version compatibility issue");
  
  // Fallback to disk storage in case of errors
  console.warn("⚠️ Falling back to local disk storage due to S3 configuration error");
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
    }
  });
}

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log(`🔍 Validating file: ${file.originalname} (${file.mimetype})`);
    if (file.mimetype.startsWith('image/')) {
      console.log(`✅ File accepted: ${file.originalname}`);
      cb(null, true);
    } else {
      console.error(`❌ File rejected: ${file.originalname} (not an image)`);
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Wrap the original single function for better logging
const originalSingle = upload.single;
upload.single = function(fieldname) {
  const middleware = originalSingle.call(this, fieldname);
  
  return function(req, res, next) {
    console.log(`🔄 Processing upload for field: ${fieldname}`);
    
    middleware(req, res, function(err) {
      if (err) {
        console.error(`❌ Upload error:`, err);
        
        // Check for specific version incompatibility errors
        if (err.message && (
          err.message.includes('send is not a function') || 
          err.message.includes('this.client.send is not a function')
        )) {
          console.error('❌ COMPATIBILITY ERROR DETECTED: This error is typically caused by');
          console.error('❌ using multer-s3 v3.x with AWS SDK v2 or vice versa.');
          console.error('❌ FIX: Make sure you have multer-s3@2.10.0 installed with AWS SDK v2');
          console.error('❌ Run: npm uninstall multer-s3 && npm install multer-s3@2.10.0');
        }
      } else if (req.file) {
        console.log(`✅ Upload successful for ${fieldname}`);
        console.log(`📄 File details:`, {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          bucket: req.file.bucket,
          key: req.file.key,
          location: req.file.location || '(No location URL available)'
        });
        
        if (req.file.location) {
          console.log(`🔗 S3 URL: ${req.file.location}`);
        } else {
          console.warn(`⚠️ No S3 URL (location) was provided - this could indicate the file was saved locally`);
        }
      } else {
        console.log(`ℹ️ No file was uploaded for field ${fieldname}`);
      }
      
      next(err);
    });
  };
};

console.log(`🚀 Upload middleware initialized with ${isMulterS3V3 ? 'multer-s3 v3' : 'multer-s3 v2'}`);
console.log(`📦 Target: ${process.env.AWS_REGION || 'eu-north-1'}/${process.env.S3_BUCKET_NAME}`);

module.exports = upload;