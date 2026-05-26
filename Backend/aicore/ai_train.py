# ai_train.py
import pandas as pd
import numpy as np
import urllib.parse
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder, normalize
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import TruncatedSVD

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=dbforttcs.mssql.somee.com;"
    "DATABASE=dbforttcs;UID=shavi_SQLLogin_1;PWD=nraq1gx3wq"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

N_RECOMMENDATIONS = 5
N_TEST_SAMPLES    = 80

PRICE_TOLERANCE_BY_CAT = {
    'Laptop':     0.40,
    'Điện thoại': 0.55,
    'Tai nghe':   0.55,
    'Sạc':        0.70,
    'Card':       0.70,
}


def assign_price_tier_within_cat(df: pd.DataFrame) -> pd.Series:
    result = pd.Series(index=df.index, dtype=str)
    for cat_id, group in df.groupby('cat_id'):
        try:
            result.loc[group.index] = pd.qcut(
                group['unit_price'], q=4,
                labels=['budget', 'mid', 'upper_mid', 'premium'],
                duplicates='drop'
            ).astype(str)
        except ValueError:
            result.loc[group.index] = 'mid'
    return result


def build_group_matrix(group_df: pd.DataFrame):
    n = len(group_df)
    if n < 2:
        return None, group_df

    tfidf_raw = TfidfVectorizer(ngram_range=(1, 2)).fit_transform(
        group_df['content_tags'].fillna('')
    )
    n_components  = min(50, n - 1, tfidf_raw.shape[1] - 1)
    tfidf_reduced = TruncatedSVD(n_components=n_components, random_state=42).fit_transform(tfidf_raw)

    price_cont = MinMaxScaler().fit_transform(group_df[['unit_price']]) * 8.0

    group_df = group_df.copy()
    group_df['price_tier'] = assign_price_tier_within_cat(group_df)
    price_tier = OneHotEncoder(sparse_output=False, handle_unknown='ignore').fit_transform(
        group_df[['price_tier']]
    ) * 15.0

    brand = OneHotEncoder(handle_unknown='ignore', sparse_output=False).fit_transform(
        group_df[['brand']]
    ) * 6.0

    combined = np.hstack([tfidf_reduced, price_cont, price_tier, brand])
    return normalize(combined, norm='l2'), group_df


# 🛠️ VỊ TRÍ ĐÃ SỬA (LỖI 1): Đưa hàm này ra ngoài hẳn, đứng độc lập trước run_training()
def generate_cart_recommendations(engine, all_recs_df):
    print("\nĐang tính priority_cart từ giỏ hàng...")

    carts = pd.read_sql("SELECT user_id, product_id, quantity FROM Carts", engine)
    if carts.empty:
        print("Không có giỏ hàng nào.")
        return

    print(f"Tìm thấy {len(carts)} dòng giỏ hàng, {carts['user_id'].nunique()} users")

    cart_recs = []
    for user_id, user_cart in carts.groupby('user_id'):
        cart_product_ids = user_cart['product_id'].tolist()
        representative_product_id = cart_product_ids[0]

        similar = all_recs_df[
            all_recs_df['product_id'].isin(cart_product_ids)
        ].copy()
        if similar.empty:
            continue

        similar = similar[~similar['suggested_product_id'].isin(cart_product_ids)]

        grouped = (
            similar.groupby('suggested_product_id')['score']
            .sum()
            .reset_index()
            .sort_values('score', ascending=False)
            .head(10)
        )

        for _, row in grouped.iterrows():
            cart_recs.append({
                'product_id':           int(representative_product_id),
                'suggested_product_id': int(row['suggested_product_id']),
                'score':                round(float(row['score']), 4),
                'type':                 'priority_cart',
                'user_id':              str(user_id),
            })

    if not cart_recs:
        print("Không tạo được priority_cart nào.")
        return

    cart_df = pd.DataFrame(cart_recs)
    print(f"Đang ghi {len(cart_df)} dòng priority_cart...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM dbo.ai_train_data WHERE type = 'priority_cart'"))
        cart_df.to_sql('ai_train_data', conn, if_exists='append', index=False)
    print(f"Hoàn tất priority_cart cho {cart_df['user_id'].nunique()} users")


def run_training():
    print("--- [START] Huấn luyện theo từng category ---")

    # 🛠️ VỊ TRÍ ĐÃ SỬA (LỖI 2): Đưa đoạn kéo dữ liệu SQL và print phân bố lên ĐẦU hàm run_training()
    df = pd.read_sql("""
        SELECT r.product_id, r.brand, r.unit_price, r.content_tags,r.is_synthetic,
               p.cat_id, c.cat_name
        FROM ai_ready_data r
        JOIN Products p ON r.product_id = p.product_id
        JOIN Categories c ON p.cat_id = c.cat_id
    """, engine).reset_index(drop=True)

    print(f"Tổng sản phẩm: {len(df)}")
    print(f"Phân bố:\n{df['cat_name'].value_counts().to_string()}\n")

    all_recs    = []
    all_results = []

    for cat_id, group in df.groupby('cat_id'):
        cat_name  = group['cat_name'].iloc[0]
        group     = group.reset_index(drop=True)
        tolerance = PRICE_TOLERANCE_BY_CAT.get(cat_name, 0.50)

        print(f"[{cat_name}] {len(group)} sản phẩm | tolerance={tolerance:.0%}")

        matrix, group = build_group_matrix(group)
        if matrix is None:
            print("  → Bỏ qua (quá ít sản phẩm)\n")
            continue

        model = NearestNeighbors(metric='cosine', algorithm='brute')
        model.fit(matrix)

        n_test       = min(N_TEST_SAMPLES, len(group))
        test_indices = group.sample(n=n_test, random_state=42).index.tolist()
        wrong_examples = []

        for idx in test_indices:
            src = group.loc[idx]
            k   = min(N_RECOMMENDATIONS + 1, len(group))
            distances, indices = model.kneighbors(
                matrix[idx].reshape(1, -1), n_neighbors=k
            )
            recs   = indices.flatten()[1:]
            scores = 1 - distances.flatten()[1:]

            correct = 0
            for rec_idx, score in zip(recs, scores):
                rec      = group.iloc[rec_idx]
                price_ok = (
                    abs(src['unit_price'] - rec['unit_price'])
                    / (src['unit_price'] + 1)
                ) <= tolerance
                if price_ok:
                    correct += 1
                elif len(wrong_examples) < 3:
                    wrong_examples.append(
                        f"  {src['brand']} {src['unit_price']:,.0f}đ"
                        f" → {rec['brand']} {rec['unit_price']:,.0f}đ"
                        f" (scorơe={score:.3f})"
                    )
            all_results.append({
                'cat_name':  cat_name,
                'precision': correct / (k - 1),
            })

        cat_prec = np.mean([r['precision'] for r in all_results if r['cat_name'] == cat_name])
        print(f"  Precision: {cat_prec:.1%}")
        if wrong_examples:
            print("  Gợi ý sai:")
            for ex in wrong_examples:
                print(ex)
        print()

        for idx in range(len(group)):
            src = group.iloc[idx]
            k   = min(N_RECOMMENDATIONS + 1, len(group))
            distances, indices = model.kneighbors(
                matrix[idx].reshape(1, -1), n_neighbors=k
            )
            for rec_idx, dist in zip(indices.flatten()[1:], distances.flatten()[1:]):
                score    = 1 - dist
                rec      = group.iloc[rec_idx]
                price_ok = (
                    abs(src['unit_price'] - rec['unit_price'])
                    / (src['unit_price'] + 1)
                ) <= tolerance
                if price_ok and score > 0.1 and int(rec.get('is_synthetic', 0)) == 0:
                    all_recs.append({
                        'product_id':           int(src['product_id']),
                        'suggested_product_id': int(rec['product_id']), # Đảm bảo ID thật 100% xuất lên Web
                        'score':                round(float(score), 4),
                        'type':                 'item_similarity',
                    })

    results_df = pd.DataFrame(all_results)
    print("=" * 50)
    print(f"  Precision trung bình     : {results_df['precision'].mean():.1%}")
    print(f"  Sản phẩm đúng 5/5        : {(results_df['precision'] == 1.0).mean() * 100:.1f}%")
    print(f"  Sản phẩm đúng >= 4/5     : {(results_df['precision'] >= 0.8).mean() * 100:.1f}%")
    print("=" * 50)
    print("\nTheo category:")
    print(results_df.groupby('cat_name')['precision']
          .agg(['mean', 'count']).round(2).to_string())

    recs_df = pd.DataFrame(all_recs)
    print(f"\nĐang ghi {len(recs_df)} cặp gợi ý vào DB...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM dbo.ai_train_data WHERE type = 'item_similarity'"))
        recs_df.to_sql('ai_train_data', conn, if_exists='append', index=False)

    # 🛠️ VỊ TRÍ ĐÃ SỬA (LỖI 3): Gọi hàm sinh giỏ hàng nằm ở CUỐI CÙNG sau khi recs_df đã tồn tại hoàn chỉnh
    generate_cart_recommendations(engine, recs_df)

    print("--- [DONE] ---")


if __name__ == "__main__":
    run_training()