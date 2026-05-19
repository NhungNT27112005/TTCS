import React, { useState, useEffect } from "react";
import "./Admin.css";
import "./AdminProducts.css";
import productService from "../services/productService";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        product_name: "", brand: "", specs_json: "",
        unit_price: "", stock_quantity: "",
        warranty_period: "", thumbnail_url: "", cat_id: ""
    });
    const [specTags, setSpecTags] = useState([]);
    const [specKey, setSpecKey] = useState("");
    const [specValue, setSpecValue] = useState("");
    const [search, setSearch] = useState("");

    const fetchProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi:", err);
            setProducts([]);
        }
    };
    const fetchCategories = async () => {
        try {
            const data = await productService.getAllCategories();
            // Kiểm tra log xem data thực sự là gì
            console.log("Dữ liệu danh mục nhận được:", data); 
            
            // Nếu data trả về là mảng thì để nguyên, nếu là object có chứa mảng thì truy xuất vào:
            setCategories(Array.isArray(data) ? data : (data.categories || []));
        } catch (err) {
            console.log("Lỗi fetch danh mục:", err);
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // ===== SPECS TAG =====
    const parseSpecsToTags = (specsJson) => {
        if (!specsJson) return [];
        try {
            const obj = typeof specsJson === "string" ? JSON.parse(specsJson) : specsJson;
            return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
        } catch { return []; }
    };

    const tagsToJson = (tags) => {
        const obj = {};
        tags.forEach(t => { if (t.key.trim()) obj[t.key.trim()] = t.value; });
        return JSON.stringify(obj);
    };

    const handleAddSpec = () => {
        if (!specKey.trim()) return;
        if (specTags.find(t => t.key === specKey.trim())) { alert("Thuộc tính này đã tồn tại!"); return; }
        setSpecTags([...specTags, { key: specKey.trim(), value: specValue }]);
        setSpecKey(""); setSpecValue("");
    };

    const handleRemoveSpec = (index) => setSpecTags(specTags.filter((_, i) => i !== index));

    const handleSpecValueChange = (index, newValue) => {
        const updated = [...specTags];
        updated[index].value = newValue;
        setSpecTags(updated);
    };

    // ===== MODAL =====
    const handleAddClick = () => {
        setIsEditMode(false);
        setCurrentProduct({ product_name: "", brand: "", specs_json: "", unit_price: "", stock_quantity: "", warranty_period: "", thumbnail_url: "", cat_id: "" });
        setSpecTags([]); setSpecKey(""); setSpecValue("");
        setShowModal(true);
    };

    const handleEditClick = (product) => {
        setIsEditMode(true);
        // Đảm bảo cat_id luôn là string để khớp với giá trị trong <select>
        setCurrentProduct({
            ...product,
            cat_id: String(product.cat_id || "") 
        });
        setSpecTags(parseSpecsToTags(product.specs_json));
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...currentProduct, specs_json: tagsToJson(specTags) };
            await productService.saveProduct(payload, isEditMode);
            alert(isEditMode ? "Cập nhật thành công!" : "Thêm thành công!");
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            alert("Thao tác thất bại: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
        try {
            await productService.deleteProduct(id);
            alert("Đã xóa!");
            fetchProducts();
        } catch (err) {
            alert("Không thể xóa: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="admin-card">
            <h2>Quản lý sản phẩm ({products.length})</h2>
            <div className="admin-card-header">
                <button className="btn-add-main" onClick={handleAddClick}>+ Thêm sản phẩm</button>
                <input type="text" placeholder="Tìm tên sản phẩm..." className="search-input"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th>
                        <th>Thương hiệu</th><th>Giá</th><th>Tồn kho</th><th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products
                        .filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()))
                        .map(p => (
                            <tr key={p.product_id}>
                                <td>#{p.product_id}</td>
                                <td><img src={p.thumbnail_url} alt="" className="admin-product-img" /></td>
                                <td>{p.product_name}</td>
                                <td>{p.cat_name}</td>
                                <td>{p.brand}</td>
                                <td>{Number(p.unit_price).toLocaleString()}đ</td>
                                <td>{p.stock_quantity}</td>
                                <td>
                                    <div className="admin-actions-cell">
                                        <button className="btn-action btn-edit" onClick={() => handleEditClick(p)}>Sửa</button>
                                        <button className="btn-action btn-delete" onClick={() => handleDelete(p.product_id)}>Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>{isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h3>
                            <button className="close-x" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên sản phẩm</label>
                                <input type="text" value={currentProduct.product_name} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, product_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Thương hiệu</label>
                                <input type="text" value={currentProduct.brand} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, brand: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Danh mục</label>
                                <select value={currentProduct.cat_id}
                                    onChange={e => setCurrentProduct({ ...currentProduct, cat_id: e.target.value })}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => (
                                        <option key={cat.cat_id} value={cat.cat_id}>{cat.cat_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Giá tiền</label>
                                <input type="number" value={currentProduct.unit_price} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, unit_price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Tồn kho</label>
                                <input type="number" value={currentProduct.stock_quantity} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, stock_quantity: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Bảo hành (tháng)</label>
                                <input type="number" value={currentProduct.warranty_period} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, warranty_period: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>URL hình ảnh</label>
                                <input type="text" value={currentProduct.thumbnail_url} required
                                    onChange={e => setCurrentProduct({ ...currentProduct, thumbnail_url: e.target.value })} />
                            </div>

                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label>Thông số kỹ thuật</label>
                                <div className="specs-tag-list">
                                    {specTags.map((tag, index) => (
                                        <div key={index} className="spec-tag-row">
                                            <span className="spec-tag-key">{tag.key}</span>
                                            <input className="spec-tag-value-input" type="text" value={tag.value}
                                                onChange={e => handleSpecValueChange(index, e.target.value)} />
                                            <button type="button" className="spec-tag-remove" onClick={() => handleRemoveSpec(index)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="spec-add-row">
                                    <input type="text" className="spec-add-key" placeholder="Key (vd: RAM)"
                                        value={specKey} onChange={e => setSpecKey(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddSpec(); } }} />
                                    <input type="text" className="spec-add-value" placeholder="Giá trị (vd: 16GB)"
                                        value={specValue} onChange={e => setSpecValue(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddSpec(); } }} />
                                    <button type="button" className="spec-add-btn" onClick={handleAddSpec}>+ Thêm</button>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">{isEditMode ? "Cập nhật" : "Thêm sản phẩm"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;