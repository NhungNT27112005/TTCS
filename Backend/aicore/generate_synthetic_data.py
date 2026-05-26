import pandas as pd
import json
import random
import re
import urllib.parse
from sqlalchemy import create_engine, text

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=dbforttcs.mssql.somee.com;"
    "DATABASE=dbforttcs;UID=shavi_SQLLogin_1;PWD=nraq1gx3wq"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

# Các hậu tố để đổi tên sản phẩm cho đa dạng
NAME_SUFFIXES = ['', 'Pro', 'Max', 'Ultra', 'Plus', 'V2', 'Gen 2', 'Special Edition', 'Premium']
RAM_OPTIONS = ['8 GB', '16 GB', '32 GB', '64 GB']
STORAGE_OPTIONS = ['128 GB', '256 GB', '512 GB', '1 TB']

def augment_specs(specs_str, cat_name):
    """Xáo trộn nhẹ thông số specs_json dựa theo category"""
    try:
        specs = json.loads(specs_str) if isinstance(specs_str, str) else {}
    except:
        return specs_str

    if not specs:
        return specs_str

    # Tạo bản sao để tránh ghi đè dữ liệu gốc
    new_specs = specs.copy()

    # Nếu là Laptop hoặc Điện thoại, xáo trộn RAM và Ổ cứng
    if cat_name in ['Laptop', 'Điện thoại']:
        # Tìm và đổi RAM nếu có
        ram_key = 'RAM' if 'RAM' in new_specs else ('Dung lượng RAM' if 'Dung lượng RAM' in new_specs else None)
        if ram_key:
            new_specs[ram_key] = random.choice(RAM_OPTIONS)
            
        # Tìm và đổi Ổ cứng / Bộ nhớ trong
        rom_key = 'Ổ cứng' if 'Ổ cứng' in new_specs else ('Bộ nhớ trong' if 'Bộ nhớ trong' in new_specs else None)
        if rom_key:
            new_specs[rom_key] = random.choice(STORAGE_OPTIONS)

    # Nếu là Sạc, ngẫu nhiên hóa lại công suất
    elif cat_name == 'Sạc':
        for k, v in new_specs.items():
            if 'W' in str(v):
                new_specs[k] = f"{random.choice([20, 30, 45, 65, 100, 140])}W"

    return json.dumps(new_specs, ensure_ascii=False)

def start_augmentation(multiplier=10):
    """
    multiplier=10 nghĩa là 1 sản phẩm gốc sẽ đẻ ra thêm 10 sản phẩm biến thể mới.
    Nếu bạn có 100 sản phẩm gốc -> Hệ thống sẽ tạo ra 1000 sản phẩm.
    """
    print("📥 Đang đọc dữ liệu gốc từ Database...")
    query = """
        SELECT p.product_id, p.product_name, p.brand, p.unit_price, p.specs_json, p.cat_id, c.cat_name
        FROM Products p
        JOIN Categories c ON p.cat_id = c.cat_id
    """
    df_src = pd.read_sql(query, engine)
    
    if df_src.empty:
        print("❌ Không tìm thấy dữ liệu gốc trong bảng Products!")
        return

    print(f"Tìm thấy {len(df_src)} sản phẩm gốc. Bắt đầu quá trình nhân bản x{multiplier}...")
    
    # 1. Đánh dấu dữ liệu gốc ban đầu là THẬT (0)
    df_src['is_synthetic'] = 0
    
    synthetic_records = [df_src]
    fake_id_counter = 10000  # ID giả lập bắt đầu từ 10000 trở đi
    
    for i in range(multiplier):
        df_copy = df_src.copy()
        
        # Đánh dấu đây là dữ liệu GIẢ LẬP (1)
        df_copy['is_synthetic'] = 1
        
        # Thay đổi thông số biến thể (Giá, Tên, Specs)
        df_copy['unit_price'] = df_copy['unit_price'].apply(lambda x: round(float(x) * random.uniform(0.85, 1.15), -4))
        df_copy['product_name'] = df_copy['product_name'].apply(lambda x: f"{x} {random.choice(NAME_SUFFIXES)}".strip())
        df_copy['specs_json'] = df_copy.apply(lambda row: augment_specs(row['specs_json'], row['cat_name']), axis=1)
        
        # Tạo ID độc lập cho sản phẩm giả để AI phân biệt các biến thể cấu hình
        df_copy['product_id'] = df_copy['product_id'] + fake_id_counter
        fake_id_counter += 10000 # Mỗi vòng lặp nhảy thêm một bậc để không trùng nhau
        
        synthetic_records.append(df_copy)
        
    df_final = pd.concat(synthetic_records, ignore_index=True)
    return df_final
if __name__ == "__main__":
    # Sinh dữ liệu nhân bản
    large_df = start_augmentation(multiplier=12) # Nhân bản gấp 12 lần dữ liệu gốc
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "synthetic_products.csv")
    # Ở đây, thay vì lưu đè vào bảng Products thật (rất nguy hiểm làm hỏng data web bán hàng),
    # Chúng ta sẽ lưu trực tiếp kết quả đã nhân bản này vào file csv hoặc chạy quy trình enrich thẳng từ biến này.
    large_df.to_csv(csv_path, index=False, encoding='utf-8-sig')
    print("💾 Đã lưu file dữ liệu khổng lồ ra 'synthetic_products.csv'!")