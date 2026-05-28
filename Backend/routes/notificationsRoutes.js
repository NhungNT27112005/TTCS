// routes/notificationRoutes.js
import express from "express";
import { connectDB }
from "../config/db.js";

const router = express.Router();

router.get("/", async(req,res)=>{
   try{
      const pool = await connectDB();
      try{
         const result = await pool
         .request()
         .query(`
            SELECT TOP 10
            COALESCE(
              notification_id,
              id
            ) AS id,
            title,
            message,
            created_at,
            is_read
            FROM dbo.Notifications
            ORDER BY created_at DESC
         `);

         return res.json(
           result.recordset
         );

      }catch(dbErr){

         const mockNotifications = [
           {
             id:1,
             title:"Chào mừng sếp",
             message:
             "Chào mừng sếp đã đến với hệ thống công nghệ E-Tech v2026!",
             created_at:
             new Date(),
             is_read:0
           }
         ];

         return res.json(
           mockNotifications
         );
      }

   }catch(err){

      console.error(
       err.message
      );

      res.status(500)
      .json({
        message:
        "Lỗi hệ thống thông báo"
      });
   }
});

export default router;