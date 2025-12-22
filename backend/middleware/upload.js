// const multer = require('multer');
// const path = require('path');

// // Cấu hình nơi lưu trữ và tên file
// const storage = multer.diskStorage({
//     // Nơi file sẽ được lưu
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Thư mục 'uploads'
//     },
//     // Tạo tên file mới để tránh trùng lặp
//     filename: function (req, file, cb) {
//         // Tên file mới sẽ là: <ngày-tháng-năm>-<tên-file-gốc>
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// // Kiểm tra loại file, chỉ cho phép ảnh
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true); // Chấp nhận file
//     } else {
//         cb(new Error('Chỉ chấp nhận file ảnh!'), false); // Từ chối file
//     }
// };

// // Khởi tạo multer với cấu hình đã tạo
// const upload = multer({ 
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn kích thước file 5MB
// });

// module.exports = upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/images/';
    
    if (file.fieldname === 'avatar') {
      folder += 'avatars/';
    } else if (file.fieldname === 'model3D') {
      folder = 'public/models/';
    } else if (file.fieldname === 'images') {
      folder += 'pets/';
    } else {
      folder += 'others/';
    }
    
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  const allowedModels = /glb|gltf/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (file.fieldname === 'model3D') {
    if (allowedModels.test(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Chỉ chấp nhận file .glb hoặc .gltf'));
  }
  
  if (allowedImages.test(ext)) {
    return cb(null, true);
  }
  
  cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB cho file .glb
  },
});

module.exports = upload;