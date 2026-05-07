import express from 'express';
import cors from 'cors';

import { connectDB } from '../db.js';

const routes = express.Router();

routes.use(express.json());
routes.use(cors());


// ======================================
// GET ALL USERS
// ======================================

routes.get('/', async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()

            .query(`
                SELECT *

                FROM Users

                ORDER BY user_id DESC
            `);

        res.status(200).json(
            result.recordset
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});


// ======================================
// UPDATE ROLE
// ======================================

routes.put('/:id/role', async (req, res) => {

    try {

        const { id } = req.params;

        const { role_id } = req.body;

        const pool = await connectDB();

        await pool.request()

            .input('id', id)

            .input('role_id', role_id)

            .query(`

                UPDATE Users

                SET role_id = @role_id

                WHERE user_id = @id
            `);

        res.json({

            message:
                'Cập nhật role thành công!'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});


// ======================================
// BLOCK / UNBLOCK
// ======================================

routes.put('/:id/status', async (req, res) => {

    try {

        const { id } = req.params;

        const { is_active } = req.body;

        const pool = await connectDB();

        await pool.request()

            .input('id', id)

            .input('is_active', is_active)

            .query(`

                UPDATE Users

                SET is_active = @is_active

                WHERE user_id = @id
            `);

        res.json({

            message:
                'Cập nhật trạng thái thành công!'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});


// ======================================
// DELETE USER
// ======================================

routes.delete('/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await connectDB();

        await pool.request()

            .input('id', id)

            .query(`

                DELETE FROM Users

                WHERE user_id = @id
            `);

        res.json({

            message:
                'Xóa user thành công!'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});

export default routes;