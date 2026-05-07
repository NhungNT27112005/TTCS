import React, {

    useEffect,
    useState

} from 'react';

import {

    useParams,
    useNavigate

} from 'react-router-dom';

import './Admin.css';
import './OrderDetail.css';


const OrderDetail = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [details, setDetails] = useState([]);

    const [status, setStatus] = useState('');

    const [loading, setLoading] = useState(true);


    // =====================================
    // LOAD ORDER
    // =====================================

    const loadOrder = async () => {

        try {

            const response = await fetch(

                `http://localhost:5000/api/orders/${id}`
            );

            const data = await response.json();

            console.log(data);

            setDetails(data);

            // set status hiện tại

            if (
                Array.isArray(data) &&
                data.length > 0
            ) {

                setStatus(
                    data[0].order_status
                );
            }

            setLoading(false);

        } catch (err) {

            console.log(err);

            setLoading(false);
        }
    };


    // =====================================
    // FIRST LOAD
    // =====================================

    useEffect(() => {

        loadOrder();

    }, [id]);


    // =====================================
    // UPDATE STATUS
    // =====================================

    const handleUpdateStatus = async () => {

        try {

            const response = await fetch(

                `http://localhost:5000/api/orders/${id}`,

                {

                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            // reload order mới nhất

            await loadOrder();

            alert(
                'Cập nhật trạng thái thành công!'
            );

        } catch (err) {

            console.log(err);

            alert(
                'Cập nhật thất bại!'
            );
        }
    };


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <div className="admin-card">

                <h2>

                    Đang tải dữ liệu...

                </h2>

            </div>
        );
    }


    // =====================================
    // EMPTY
    // =====================================

    if (
        !Array.isArray(details) ||
        details.length === 0
    ) {

        return (

            <div className="admin-card">

                <h2>

                    Không tìm thấy đơn hàng

                </h2>

            </div>
        );
    }


    // =====================================
    // ORDER DATA
    // =====================================

    const order = details[0];


    // =====================================
    // TOTAL PRICE
    // =====================================

    const totalPrice = details.reduce(

        (sum, item) =>

            sum +

            (
                item.quantity *
                item.unit_price_at_sale
            ),

        0
    );


    return (

        <div className="admin-card">


            {/* HEADER */}

            <div className="order-detail-header">

                <div>

                    <h2>

                        Chi tiết đơn hàng #{id}

                    </h2>

                    <p>

                        Ngày tạo:

                        {
                            new Date(
                                order.created_at
                            ).toLocaleDateString()
                        }

                    </p>

                </div>


                <button

                    className="btn-back"

                    onClick={() =>
                        navigate('/orders')
                    }
                >

                    Quay lại

                </button>

            </div>


            {/* CUSTOMER */}

            <div className="order-customer-box">

                <h3>

                    Thông tin khách hàng

                </h3>

                <p>

                    <strong>Tên:</strong>

                    {order.username}

                </p>

                <p>

                    <strong>Email:</strong>

                    {order.email}

                </p>

            </div>


            {/* TABLE */}

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>Ảnh</th>

                        <th>Sản phẩm</th>

                        <th>Số lượng</th>

                        <th>Đơn giá</th>

                        <th>Bảo hành</th>

                    </tr>

                </thead>


                <tbody>

                    {
                        details.map(item => (

                            <tr key={item.detail_id}>

                                <td>

                                    <img

                                        src={
                                            item.thumbnail_url
                                        }

                                        alt=""

                                        className="order-product-img"
                                    />

                                </td>

                                <td>

                                    {item.product_name}

                                </td>

                                <td>

                                    {item.quantity}

                                </td>

                                <td>

                                    {
                                        Number(
                                            item.unit_price_at_sale
                                        )
                                        .toLocaleString()
                                    }đ

                                </td>

                                <td>

                                    {
                                        item.warranty_period_applied
                                    } tháng

                                </td>

                            </tr>
                        ))
                    }

                </tbody>

            </table>


            {/* FOOTER */}

            <div className="order-detail-footer">


                {/* TOTAL */}

                <div className="order-total-box">

                    <h3>

                        Tổng tiền

                    </h3>

                    <h2>

                        {
                            Number(
                                totalPrice
                            ).toLocaleString()
                        }đ

                    </h2>

                </div>


                {/* STATUS */}

                <div className="order-status-box">

                    <h3>

                        Trạng thái

                    </h3>


                    <select

                        value={status}

                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }
                    >

                        <option value="pending">

                            Chờ xử lý

                        </option>

                        <option value="shipping">

                            Đang giao

                        </option>

                        <option value="completed">

                            Hoàn thành

                        </option>

                        <option value="cancelled">

                            Đã hủy

                        </option>

                    </select>


                    <button

                        className="btn-save"

                        onClick={
                            handleUpdateStatus
                        }
                    >

                        Cập nhật

                    </button>

                </div>

            </div>

        </div>
    );
};

export default OrderDetail;