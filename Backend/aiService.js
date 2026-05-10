import { connectDB } from "./db.js";

export async function getAiProductSuggestions(productId, userId, limit = 5) {
  const pool = await connectDB();

  if (userId) {
    const cartResult = await pool.request()
      .input("userId", userId)
      .query(`
        SELECT p.product_id, p.brand, p.unit_price
        FROM dbo.Carts c
        JOIN dbo.Products p ON c.product_id = p.product_id
        WHERE c.user_id = @userId
      `);

    if (cartResult.recordset.length > 0) {
      const avgPrice = Math.round(
        cartResult.recordset.reduce((sum, item) => sum + item.unit_price, 0) / cartResult.recordset.length
      );
      const minPrice = Math.max(0, Math.floor(avgPrice * 0.75));
      const maxPrice = Math.ceil(avgPrice * 1.25);

      const cartBased = await pool.request()
        .input("userId", userId)
        .input("avgPrice", avgPrice)
        .input("minPrice", minPrice)
        .input("maxPrice", maxPrice)
        .query(`
          SELECT TOP ${limit}
            p.product_id,
            p.product_name,
            p.unit_price,
            p.thumbnail_url AS image_url,
            p.brand
          FROM dbo.Products p
          WHERE p.product_id NOT IN (
            SELECT product_id FROM dbo.Carts WHERE user_id = @userId
          )
            AND (
              p.brand IN (
                SELECT DISTINCT p2.brand
                FROM dbo.Products p2
                JOIN dbo.Carts c2 ON p2.product_id = c2.product_id
                WHERE c2.user_id = @userId
              )
              OR p.unit_price BETWEEN @minPrice AND @maxPrice
            )
          ORDER BY
            CASE WHEN p.brand IN (
              SELECT DISTINCT p2.brand
              FROM dbo.Products p2
              JOIN dbo.Carts c2 ON p2.product_id = c2.product_id
              WHERE c2.user_id = @userId
            ) THEN 0 ELSE 1 END,
            ABS(p.unit_price - @avgPrice),
            p.product_name
        `);

      if (cartBased.recordset.length > 0) {
        return cartBased.recordset;
      }
    }
  }

  const request = pool.request();
  if (productId) {
    request.input("productId", productId);
  }

  const query = `
    SELECT TOP ${limit}
      p.product_id,
      p.product_name,
      p.unit_price,
      p.thumbnail_url AS image_url,
      p.brand
    FROM dbo.ai_train_data a
    JOIN dbo.Products p ON a.product_id = p.product_id
    ${productId ? "WHERE a.product_id <> @productId" : ""}
    GROUP BY
      p.product_id,
      p.product_name,
      p.unit_price,
      p.thumbnail_url,
      p.brand
    ORDER BY COUNT(*) DESC, p.product_name
  `;

  const result = await request.query(query);
  if (result.recordset.length > 0) {
    return result.recordset;
  }

  const fallback = await pool.request().query(`
    SELECT TOP ${limit}
      product_id,
      product_name,
      unit_price,
      thumbnail_url AS image_url,
      brand
    FROM dbo.Products
    ORDER BY NEWID()
  `);

  return fallback.recordset;
}
