import express from 'express';
import productModule from '../modules/productModule.js';
import  {verifyAdmin} 
from "../middleware/adminMiddleware.js";

const router = express.Router();

// ================= ADMIN =================

// Danh sách sản phẩm
router.get('/', verifyAdmin, async(req,res)=>{
   try{
      res.json(
       await productModule
       .adminListProducts()
      );
   }catch(err){
      res.status(500)
      .json({
        message:
        err.message
      });
   }
});

// Thêm sản phẩm
router.post('/', verifyAdmin, async(req,res)=>{
   try{
      await productModule
      .adminAddProduct(
       req.body
      );

      res.status(201)
      .json({
       message:
       "Thêm thành công"
      });

   }catch(err){

      res.status(500)
      .json({
       message:
       err.message
      });
   }
});

// Sửa sản phẩm
router.put('/:id', verifyAdmin, async(req,res)=>{
   try{
      await productModule
      .adminEditProduct(
        req.params.id,
        req.body
      );

      res.json({
       message:
       "Cập nhật thành công"
      });

   }catch(err){

      res.status(500)
      .json({
       message:
       err.message
      });
   }
});

// Xóa sản phẩm
router.delete('/:id', verifyAdmin,
 async(req,res)=>{
   try{

      await productModule
      .adminDeleteProduct(
        req.params.id
      );

      res.json({
       message:
       "Đã xóa sản phẩm"
      });

   }catch(err){

      res.status(500)
      .json({
       message:
       err.message
      });
   }
});

// Category admin
router.get('/categories', verifyAdmin, async(req,res)=>{
   try{
      res.json(
        await productModule
        .adminListCategories()
      );
   }catch(err){
      res.status(500)
      .json({
       message:
       err.message
      });
   }
});

export default router;