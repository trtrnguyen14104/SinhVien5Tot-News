const express = require('express');
const router = express.Router();

const { authenticate, requireAdmin } = require('../middlewares/auth');
const { uploadImage, uploadDocument } = require('../middlewares/upload');

const authCtrl    = require('../controllers/auth.controller');
const postsCtrl   = require('../controllers/posts.controller');
const miscCtrl    = require('../controllers/misc.controller');

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/login',           authCtrl.login);
router.get ('/auth/me',  authenticate, authCtrl.getMe);
router.put ('/auth/password', authenticate, authCtrl.changePassword);

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.get('/posts',             postsCtrl.getPosts);
router.get('/posts/:slug',       postsCtrl.getPostBySlug);
router.get('/categories',        miscCtrl.getCategories);
router.get('/featured-students', miscCtrl.getStudents);
router.get('/documents',         miscCtrl.getDocuments);
router.get('/banners',           miscCtrl.getBanners);

// ─── POSTS (admin + editor đều làm được) ──────────────────────────────────────
router.get   ('/admin/posts',      authenticate, postsCtrl.getAllPostsAdmin);
router.get   ('/admin/posts/:id',  authenticate, postsCtrl.getPostById);
router.post  ('/admin/posts',      authenticate, postsCtrl.createPost);
router.put   ('/admin/posts/:id',  authenticate, postsCtrl.updatePost);
router.delete('/admin/posts/:id',  authenticate, requireAdmin, postsCtrl.deletePost);

// ─── STUDENTS (editor + admin) ────────────────────────────────────────────────
router.post  ('/admin/students',      authenticate, miscCtrl.createStudent);
router.put   ('/admin/students/:id',  authenticate, miscCtrl.updateStudent);
router.delete('/admin/students/:id',  authenticate, requireAdmin, miscCtrl.deleteStudent);

// ─── DOCUMENTS (editor + admin) ───────────────────────────────────────────────
router.get   ('/admin/documents',      authenticate, miscCtrl.getDocuments);
router.post  ('/admin/documents',      authenticate, miscCtrl.createDocument);
router.put   ('/admin/documents/:id',  authenticate, miscCtrl.updateDocument);
router.delete('/admin/documents/:id',  authenticate, requireAdmin, miscCtrl.deleteDocument);

// ─── BANNERS (editor + admin) ─────────────────────────────────────────────────
router.get   ('/admin/banners',        authenticate, miscCtrl.getBanners);
router.post  ('/admin/banners',        authenticate, miscCtrl.createBanner);
router.put   ('/admin/banners/:id',    authenticate, miscCtrl.updateBanner);
router.delete('/admin/banners/:id',    authenticate, requireAdmin, miscCtrl.deleteBanner);

// ─── UPLOAD (editor + admin) ──────────────────────────────────────────────────
router.post('/admin/upload/image',    authenticate, uploadImage.single('file'),    miscCtrl.uploadFile);
router.post('/admin/upload/document', authenticate, uploadDocument.single('file'), miscCtrl.uploadFile);

// ─── DASHBOARD (admin only) ───────────────────────────────────────────────────
router.get('/admin/dashboard', authenticate, requireAdmin, miscCtrl.getDashboardStats);

// ─── USER MANAGEMENT (admin only) ────────────────────────────────────────────
router.get   ('/admin/users',      authenticate, requireAdmin, miscCtrl.getUsers);
router.post  ('/admin/users',      authenticate, requireAdmin, miscCtrl.createUser);
router.put   ('/admin/users/:id',  authenticate, requireAdmin, miscCtrl.updateUser);
router.delete('/admin/users/:id',  authenticate, requireAdmin, miscCtrl.deleteUser);

module.exports = router;
