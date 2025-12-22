//     const express = require('express');
//     const router = express.Router();
//     const multer = require('multer');
//     const path = require('path');
//     const Pet = require('../models/Pet');
//     const { protect, admin } = require('../middleware/authMiddleware');
//     const upload = require('../middleware/upload');

//     // Cấu hình Multer để lưu trữ file ảnh
//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, 'public/images/'); // Thư mục lưu ảnh
//         },
//         filename: function (req, file, cb) {
//             // Tạo tên file duy nhất để tránh bị ghi đè
//             cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//         }
//     });

//     // Middleware của Multer, cập nhật để nhận một MẢNG ảnh (tối đa 10 ảnh)
//     // Tên trường phải là 'images' để khớp với FormData ở frontend
//     const upload = multer({ storage: storage });


//     // --- CÁC API ENDPOINTS ---

//     /**
//      * @route   GET /api/pets
//      * @desc    Lấy tất cả thú cưng
//      * @access  Public
//      */
//     router.get('/', async (req, res) => {
//         try {
//             const pets = await Pet.find({}).sort({ createdAt: -1 });
//             res.json(pets);
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Lỗi Server');
//         }
//     });

//     /**
//      * @route   GET /api/pets/:id
//      * @desc    Lấy chi tiết một thú cưng
//      * @access  Public
//      */
//     router.get('/:id', async (req, res) => {
//         try {
//             const pet = await Pet.findById(req.params.id);
//             if (!pet) {
//                 return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
//             }
//             res.json(pet);
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Lỗi Server');
//         }
//     });


//     /**
//      * @route   POST /api/pets
//      * @desc    Thêm một thú cưng mới (hỗ trợ nhiều ảnh)
//      * @access  Private/Admin
//      */
//     router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
//         try {
//             const petData = { ...req.body };

//             // req.files là một MẢNG các file đã được tải lên
//             if (req.files && req.files.length > 0) {
//                 petData.images = req.files.map(file => file.filename);
//             }

//             // Xử lý chuỗi requirements từ form thành mảng
//             if (petData.requirements && typeof petData.requirements === 'string') {
//                 petData.requirements = petData.requirements.split(',').map(item => item.trim()).filter(Boolean);
//             }

//             const newPet = new Pet(petData); 
//             const savedPet = await newPet.save();
//             res.status(201).json(savedPet);
//         } catch (err) {
//             console.error(err.message);
//             res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: err.message });
//         }
//     });

//     /**
//      * @route   PUT /api/pets/:id
//      * @desc    Cập nhật thông tin một thú cưng (hỗ trợ tải lại nhiều ảnh)
//      * @access  Private/Admin
//      */
//     router.put('/:id', protect, admin, upload.array('images', 10), async (req, res) => {
//         try {
//             const updateData = { ...req.body };

//             // Nếu có ảnh mới được tải lên, nó sẽ THAY THẾ hoàn toàn mảng ảnh cũ
//             if (req.files && req.files.length > 0) {
//                 updateData.images = req.files.map(file => file.filename);
//             }

//             // Xử lý chuỗi requirements
//             if (updateData.requirements && typeof updateData.requirements === 'string') {
//                 updateData.requirements = updateData.requirements.split(',').map(item => item.trim()).filter(Boolean);
//             } else if (updateData.requirements === '') {
//                 updateData.requirements = [];
//             }

//             const pet = await Pet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

//             if (!pet) {
//                 return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
//             }
            
//             res.json(pet);
//         } catch (err) {
//             console.error(err.message);
//             res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error: err.message });
//         }
//     });

//     /**
//      * @route   DELETE /api/pets/:id
//      * @desc    Xóa một thú cưng
//      * @access  Private/Admin
//      */
//     router.delete('/:id', protect, admin, async (req, res) => {
//         try {
//             const pet = await Pet.findByIdAndDelete(req.params.id);
//             if (!pet) {
//                 return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
//             }
//             res.json({ msg: 'Đã xóa thú cưng thành công' });
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Lỗi Server');
//         }
//     });

//     module.exports = router;
//     router.patch('/:id', protect, admin, async (req, res) => {
//     try {
//         const { status } = req.body; // Lấy status từ JSON body

//         // 1. Kiểm tra dữ liệu đầu vào
//         if (status !== 'available' && status !== 'adopted') {
//             return res.status(400).json({ msg: 'Trạng thái không hợp lệ.' });
//         }

//         // 2. Tìm thú cưng
//         const pet = await Pet.findById(req.params.id);

//         if (!pet) {
//             return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
//         }

//         // 3. Cập nhật trạng thái và lưu lại
//         pet.status = status;
//         const updatedPet = await pet.save();

//         // 4. Trả về thú cưng đã cập nhật
//         res.json(updatedPet);

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Lỗi Server');
//     }
// });

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pet = require('../models/Pet');
const { protect, admin } = require('../middleware/authMiddleware');

// Cấu hình Multer để lưu trữ file ảnh và model 3D
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'public/';
        
        // Phân loại thư mục theo loại file
        if (file.fieldname === 'images') {
            folder += 'images/';
        } else if (file.fieldname === 'model3D') {
            folder += 'models/';
        }
        
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất để tránh bị ghi đè
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'images') {
        // Chỉ chấp nhận file ảnh
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    } else if (file.fieldname === 'model3D') {
        // Chỉ chấp nhận file .glb và .gltf
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.glb' || ext === '.gltf') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file .glb hoặc .gltf!'), false);
        }
    } else {
        cb(new Error('Trường không hợp lệ!'), false);
    }
};

// Middleware của Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB (cho file .glb lớn)
    }
});

// --- CÁC API ENDPOINTS ---

/**
 * @route   GET /api/pets
 * @desc    Lấy tất cả thú cưng
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find({}).sort({ createdAt: -1 });
        res.json(pets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

/**
 * @route   GET /api/pets/:id
 * @desc    Lấy chi tiết một thú cưng
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }
        res.json(pet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

/**
 * @route   POST /api/pets
 * @desc    Thêm một thú cưng mới (hỗ trợ nhiều ảnh + model 3D)
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
    try {
        const petData = { ...req.body };

        // Xử lý ảnh
        if (req.files && req.files.images && req.files.images.length > 0) {
            petData.images = req.files.images.map(file => `/images/${file.filename}`);
        }

        // Xử lý model 3D
        if (req.files && req.files.model3D && req.files.model3D.length > 0) {
            petData.model3D = `/models/${req.files.model3D[0].filename}`;
        }

        // Xử lý chuỗi requirements từ form thành mảng
        if (petData.requirements && typeof petData.requirements === 'string') {
            petData.requirements = petData.requirements.split(',').map(item => item.trim()).filter(Boolean);
        }

        const newPet = new Pet(petData); 
        const savedPet = await newPet.save();
        res.status(201).json(savedPet);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: err.message });
    }
});

/**
 * @route   PUT /api/pets/:id
 * @desc    Cập nhật thông tin một thú cưng (hỗ trợ tải lại nhiều ảnh + model 3D)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        
        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }

        const updateData = { ...req.body };

        // Nếu có ảnh mới được tải lên, thay thế mảng ảnh cũ
        if (req.files && req.files.images && req.files.images.length > 0) {
            updateData.images = req.files.images.map(file => `/images/${file.filename}`);
        } else {
            // Giữ nguyên ảnh cũ
            updateData.images = pet.images;
        }

        // Nếu có model 3D mới, thay thế model cũ
        if (req.files && req.files.model3D && req.files.model3D.length > 0) {
            updateData.model3D = `/models/${req.files.model3D[0].filename}`;
        } else {
            // Giữ nguyên model cũ
            updateData.model3D = pet.model3D;
        }

        // Xử lý chuỗi requirements
        if (updateData.requirements && typeof updateData.requirements === 'string') {
            updateData.requirements = updateData.requirements.split(',').map(item => item.trim()).filter(Boolean);
        } else if (updateData.requirements === '') {
            updateData.requirements = [];
        }

        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        res.json(updatedPet);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error: err.message });
    }
});

/**
 * @route   DELETE /api/pets/:id
 * @desc    Xóa một thú cưng
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }
        res.json({ msg: 'Đã xóa thú cưng thành công' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

/**
 * @route   PATCH /api/pets/:id
 * @desc    Cập nhật trạng thái thú cưng
 * @access  Private/Admin
 */
router.patch('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (status !== 'available' && status !== 'adopted') {
            return res.status(400).json({ msg: 'Trạng thái không hợp lệ.' });
        }

        // Tìm thú cưng
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }

        // Cập nhật trạng thái và lưu lại
        pet.status = status;
        const updatedPet = await pet.save();

        res.json(updatedPet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

module.exports = router;