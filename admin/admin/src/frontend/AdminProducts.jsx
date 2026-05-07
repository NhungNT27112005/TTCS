import React, { useState, useEffect } from "react";
import "./Admin.css";
import "./AdminProducts.css";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        product_name: "",
        brand: "",
        specs_json: "",
        unit_price: "",
        stock_quantity: "",
        warranty_period: "",
        thumbnail_url: "",
        cat_id: ""
    });

    const [search, setSearch] = useState("");

    // ================= FETCH PRODUCTS =================
    const fetchProducts = async () => {
        try {
            const res = await fetch(
                "http://localhost:5000/api/products/products"
            );
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.log(err);
        }
    };
    // ================= FETCH CATEGORIES =================
    const fetchCategories = async () => {
        try {
            const res = await fetch(
                "http://localhost:5000/api/categories/category"
            );
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);
    // add product
    const handleAddClick = () => {
        setIsEditMode(false);
        setCurrentProduct({
            product_name: "",
            brand: "",
            specs_json: "",
            unit_price: "",
            stock_quantity: "",
            warranty_period: "",
            thumbnail_url: "",
            cat_id: ""
        });
        setShowModal(true);
    };

    // ================= EDIT PRODUCT =================
    const handleEditClick = (product) => {
        setIsEditMode(true);
        setCurrentProduct(product);
        setShowModal(true);
    };

    // ================= SUBMIT =================

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ===== UPDATE =====
            if (isEditMode) {
                await fetch(
                    `http://localhost:5000/api/products/${currentProduct.product_id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(currentProduct)

                    }
                );
                alert("Cập nhật sản phẩm thành công!");
            }
            // ===== ADD =====
            else {
                await fetch(
                    "http://localhost:5000/api/products",
                    {

                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(currentProduct)
                    }
                );
                alert("Thêm sản phẩm thành công!");
            }
            fetchProducts();

            setShowModal(false);

        } catch (err) {

            console.log(err);

        }

    };

    // ================= DELETE =================

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa?")) {
            return;
        }
        try {
            await fetch(
                `http://localhost:5000/api/products/${id}`,
                {
                    method: "DELETE"
                }
            );
            fetchProducts();
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="admin-card">
            {/* HEADER */}
                <h2>
                    Quản lý sản phẩm ({products.length})
                </h2>
            <div className="admin-card-header">
                <button
                    className="btn-add-main"
                    onClick={handleAddClick}
                >
                    + Thêm sản phẩm
                </button>
                {/* SEARCH */}

                    <input
                        type="text"
                        placeholder="Tìm tên sản phẩm..."
                        className="search-input"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                
            </div>
            {/* TABLE */}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Thương hiệu</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products
                        .filter((p) => {
                            return p.product_name.toLowerCase().includes(search.toLowerCase());
                        })
                        .map((p) => (
                            <tr key={p.product_id}>
                                <td>#{p.product_id}</td>
                                <td>
                                    <img
                                        src={p.thumbnail_url}
                                    alt=""
                                    className="admin-product-img"
                                />
                            </td>
                            <td>{p.product_name}</td>
                            <td>{p.cat_name}</td>
                            <td>{p.brand}</td>
                            <td>
                                {Number(
                                    p.unit_price
                                ).toLocaleString()}đ
                            </td>
                            <td>{p.stock_quantity}</td>
                            <td>
                                <div className="admin-actions-cell">
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() =>
                                            handleEditClick(p)
                                        }
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="btn-action btn-delete"
                                        onClick={() =>
                                            handleDelete(p.product_id)
                                        }
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL */}

            {showModal && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        {/* HEADER */}

                        <div className="modal-header">

                            <h3>

                                {isEditMode
                                    ? "Chỉnh sửa sản phẩm"
                                    : "Thêm sản phẩm"}

                            </h3>

                            <button
                                className="close-x"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                &times;
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            className="admin-form"
                            onSubmit={handleSubmit}
                        >

                            {/* NAME */}

                            <div className="form-group">

                                <label>Tên sản phẩm</label>

                                <input
                                    type="text"
                                    value={currentProduct.product_name}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            product_name:
                                                e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* BRAND */}

                            <div className="form-group">

                                <label>Thương hiệu</label>

                                <input
                                    type="text"
                                    value={currentProduct.brand}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            brand: e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>Danh mục</label>

                                <select
                                    value={currentProduct.cat_id}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            cat_id: e.target.value
                                        })
                                    }
                                >

                                    <option value="">
                                        -- Chọn danh mục --
                                    </option>

                                    {categories.map((cat) => (

                                        <option
                                            key={cat.cat_id}
                                            value={cat.cat_id}
                                        >
                                            {cat.cat_name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* PRICE */}

                            <div className="form-group">

                                <label>Giá tiền</label>

                                <input
                                    type="number"
                                    value={currentProduct.unit_price}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            unit_price:
                                                e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* STOCK */}

                            <div className="form-group">

                                <label>Tồn kho</label>

                                <input
                                    type="number"
                                    value={currentProduct.stock_quantity}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            stock_quantity:
                                                e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* WARRANTY */}

                            <div className="form-group">

                                <label>Bảo hành (tháng)</label>

                                <input
                                    type="number"
                                    value={currentProduct.warranty_period}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            warranty_period:
                                                e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* IMAGE */}

                            <div className="form-group">

                                <label>URL hình ảnh</label>

                                <input
                                    type="text"
                                    value={currentProduct.thumbnail_url}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            thumbnail_url:
                                                e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            {/* SPECS */}

                            <div className="form-group">

                                <label>
                                    specs_json
                                </label>

                                <textarea
                                    rows="5"
                                    value={currentProduct.specs_json}
                                    onChange={(e) =>
                                        setCurrentProduct({
                                            ...currentProduct,
                                            specs_json:
                                                e.target.value
                                        })
                                    }
                                    placeholder='{"ram":"16GB","cpu":"i7"}'
                                />
                            </div>
                            {/* BUTTONS */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    {isEditMode
                                        ? "Cập nhật"
                                        : "Thêm sản phẩm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminProducts;