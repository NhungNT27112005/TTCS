# enrich_data.py — chạy file này TRƯỚC khi train
import pandas as pd
import json
import re
import urllib.parse
from sqlalchemy import create_engine, text

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=dbforttcs.mssql.somee.com;"
    "DATABASE=dbforttcs;UID=shavi_SQLLogin_1;PWD=nraq1gx3wq"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")


# ============================================================
# 1. CÁC HÀM PARSE CHUYÊN SÂU (Dùng cho Laptop & Điện thoại)
# ============================================================
def extract_ram_gb(ram_str: str) -> str:
    if not ram_str: return ''
    tokens = []
    m = re.search(r'(\d+)\s*GB', str(ram_str), re.IGNORECASE)
    if m:
        tokens.append(f"ram_{m.group(1)}gb")
    for ddr in ['DDR5', 'DDR4', 'LPDDR5', 'LPDDR4X']:
        if ddr.lower() in str(ram_str).lower():
            tokens.append(ddr.lower())
    return ' '.join(tokens)


def extract_screen(screen_str: str) -> str:
    if not screen_str: return ''
    tokens = []
    m = re.search(r'([\d.]+)"', str(screen_str))
    if m:
        size = float(m.group(1))
        tokens.append(f"man_hinh_{str(size).replace('.','_')}inch")
    for res in ['4K', '2K', 'WUXGA', 'Full HD+', 'Full HD', 'OLED', 'QHD', 'AMOLED', 'Retina']:
        if res.lower() in str(screen_str).lower():
            tokens.append(res.lower().replace(' ', '_').replace('+', 'plus'))
    m = re.search(r'(\d+)Hz', str(screen_str), re.IGNORECASE)
    if m:
        tokens.append(f"hz_{m.group(1)}")
    return ' '.join(tokens)


def extract_cpu(cpu_str: str) -> str:
    if not cpu_str: return ''
    tokens = []
    cpu_lower = str(cpu_str).lower()
    if 'intel' in cpu_lower:  tokens.append('intel')
    elif 'amd' in cpu_lower:  tokens.append('amd')
    elif 'apple' in cpu_lower: tokens.append('apple')
    elif 'snapdragon' in cpu_lower or 'qualcomm' in cpu_lower: tokens.append('snapdragon')
    elif 'mediatek' in cpu_lower or 'helio' in cpu_lower or 'dimensity' in cpu_lower: tokens.append('mediatek')
    
    for keyword in ['ultra 7', 'ultra 5', 'i9', 'i7', 'i5', 'i3', 'ryzen 9', 'ryzen 7', 'ryzen 5', 'm1', 'm2', 'm3', 'a17', 'a16']:
        if keyword in cpu_lower:
            tokens.append('cpu_' + keyword.replace(' ', '_'))
            break
    return ' '.join(tokens)


# ============================================================
# HÀM BỔ SUNG: Chuẩn hóa text tự động cho phụ kiện (Tai nghe, Sạc...)
# ============================================================
def clean_generic_text(text_data: str) -> str:
    """Chuyển tiếng Việt có dấu thành không dấu cơ bản và làm sạch để làm tag"""
    if not text_data: return ''
    text_data = str(text_data).lower()
    # Thay thế một số ký tự tiếng Việt phổ biến để tránh lỗi phân tách từ
    text_data = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text_data)
    text_data = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text_data)
    text_data = re.sub(r'[ìíịỉĩ]', 'i', text_data)
    text_data = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text_data)
    text_data = re.sub(r'[ùúụủũưừứựửữ]', 'u', text_data)
    text_data = re.sub(r'[ỳýỵỷỹ]', 'y', text_data)
    text_data = re.sub(r'[đ]', 'd', text_data)
    # Chỉ giữ lại chữ cái, số và dấu cách
    text_data = re.sub(r'[^a-z0-9\s]', ' ', text_data)
    return ' '.join(text_data.split())


# ============================================================
# 2. HÀM BUILD CONTENT TAGS ĐA CATEGORY
# ============================================================
def build_content_tags(row) -> str:
    try:
        specs = json.loads(row['specs_json']) if isinstance(row['specs_json'], str) else {}
    except Exception:
        specs = {}

    parts = []

    # --- 1. Category (Lặp 3x — Giúp phân loại cứng hàng đầu) ---
    cat_name = str(row.get('cat_name', '')).strip()
    cat_tag = clean_generic_text(cat_name).replace(' ', '_')
    parts += [cat_tag] * 3

    # --- 2. Brand (Lặp 2x) ---
    brand_tag = clean_generic_text(str(row.get('brand', ''))).replace(' ', '_')
    if brand_tag:
        parts += [brand_tag] * 2

    # --- 3. Xử lý rẽ nhánh theo loại Category ---
    if cat_name in ['Laptop', 'Điện thoại']:
        # Phân tích sâu cấu hình cao cấp
        cpu_raw = specs.get('Công nghệ CPU', specs.get('Chip xử lý (CPU)', ''))
        cpu_tags = extract_cpu(cpu_raw)
        if cpu_tags: parts += [cpu_tags] * 2

        ram_raw = specs.get('RAM', specs.get('Dung lượng RAM', ''))
        if ram_raw: parts.append(extract_ram_gb(ram_raw))

        screen_raw = specs.get('Kích thước màn hình', specs.get('Màn hình', ''))
        if screen_raw: parts.append(extract_screen(screen_raw))
        
        # Bộ nhớ trong (ROM) cho điện thoại/laptop
        rom_raw = specs.get('Ổ cứng', specs.get('Bộ nhớ trong', ''))
        if rom_raw: 
            m = re.search(r'(\d+)\s*(GB|TB)', str(rom_raw), re.IGNORECASE)
            if m: parts.append(f"storage_{m.group(1)}{m.group(2).lower()}")

    elif cat_name == 'Tai nghe':
        # Trích xuất các thuộc tính đặc trưng của tai nghe
        type_raw = specs.get('Loại tai nghe', '')
        if type_raw: parts.append(clean_generic_text(type_raw).replace(' ', '_'))
        if 'bluetooth' in str(specs).lower() or 'không dây' in str(specs).lower():
            parts.append('tai_nghe_khong_day')

    elif cat_name == 'Sạc':
        # Trích công suất sạc (ví dụ: 20W, 65W, 140W)
        specs_str = str(specs)
        m = re.search(r'(\d+)\s*W', specs_str, re.IGNORECASE)
        if m: parts.append(f"cong_suat_{m.group(1)}w")
        if 'type c' in specs_str.lower() or 'type-c' in specs_str.lower():
            parts.append('cong_type_c')

    # --- 4. Cơ chế Fallback (Quét tự động toàn bộ specs_json còn lại) ---
    # Mục đích: Đảm bảo bất kể linh kiện/phụ kiện nào cũng không bị sót từ khóa quan trọng
    for key, value in specs.items():
        # Bỏ qua các key quá chung chung hoặc đã xử lý nâng cao ở trên
        if key in ['Công nghệ CPU', 'RAM', 'Kích thước màn hình', 'Màn hình']: 
            continue
        
        cleaned_val = clean_generic_text(str(value))
        # Chỉ lấy các từ có giá trị phân loại cao (độ dài > 1 ký tự và không phải số thuần túy)
        words = [w for w in cleaned_val.split() if len(w) > 1 and not w.isdigit()]
        parts += words

    # --- 5. Hỗ trợ bổ sung từ tên sản phẩm ---
    # Tên sản phẩm thường chứa các model đặc trưng (Ví dụ: "Đốc sạc Anker v2")
    prod_name_clean = clean_generic_text(str(row.get('product_name', '')))
    parts += [w for w in prod_name_clean.split() if len(w) > 2]

    return ' '.join(filter(None, parts))


# ============================================================
# 3. BUILD ai_ready_data MỚI
# ============================================================
def rebuild_ai_ready_data():
    print("Đang tải dữ liệu TĂNG CƯỜNG từ file CSV giả lập...")
    # Đọc từ file CSV chứa 1000+ mẫu đã sinh thay vì SQL câu lệnh cũ
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "synthetic_products.csv")

    df = pd.read_csv(csv_path) 
    df['specs_json'] = df['specs_json'].fillna('{}')

    print(f"Tổng sản phẩm lấy để enrich: {len(df)}")
    # Xử lý tạo content_tags đa tầng
    df['content_tags'] = df.apply(build_content_tags, axis=1)

    # In kiểm tra ngẫu nhiên các category xem tag sinh ra ra sao
    print("\n=== MẪU CONTENT_TAGS THEO TỪNG CATEGORY ===")
    sample_dfs = []
    for cat, group in df.groupby('cat_name'):
        sample_dfs.append(group.head(2))
    check_df = pd.concat(sample_dfs)
    for _, row in check_df.iterrows():
        print(f"[{row['cat_name']} | {row['brand']} | {row['unit_price']:,.0f}đ] -> Tags: {row['content_tags'][:120]}...")

    # Tiến hành ghi vào DB
    # 1. Lấy thêm cột is_synthetic từ file CSV giả lập vào DataFrame đích
    ready_df = df[['product_id', 'brand', 'unit_price', 'content_tags', 'is_synthetic']].copy()
    ready_df['product_name'] = df['product_name']

    # 2. Xóa dữ liệu cũ trong bảng ai_ready_data
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM dbo.ai_ready_data"))

    # 3. Tạo cột bổ sung trên SQL Server nếu bảng cũ chưa cập nhật cấu trúc
    try:
        with engine.begin() as conn:
            conn.execute(text(
                "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME='ai_ready_data' AND COLUMN_NAME='product_name') "
                "ALTER TABLE dbo.ai_ready_data ADD product_name NVARCHAR(500)"
            ))
            # Tự động thêm cột kiểm tra thật/giả lập
            conn.execute(text(
                "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME='ai_ready_data' AND COLUMN_NAME='is_synthetic') "
                "ALTER TABLE dbo.ai_ready_data ADD is_synthetic INT DEFAULT 0"
            ))
    except Exception as e:
        print(f"Lưu ý cấu trúc bảng: {e}")

    # 4. Ghi toàn bộ dữ liệu tăng cường vào SQL Server
    with engine.begin() as conn:
        ready_df.to_sql('ai_ready_data', conn, if_exists='append', index=False)

    print(f"\n[THÀNH CÔNG] Đã chuẩn hóa dữ liệu đa dạng và nạp {len(ready_df)} bản ghi (bao gồm hàng giả lập) vào ai_ready_data")
    return ready_df


if __name__ == "__main__":
    rebuild_ai_ready_data()