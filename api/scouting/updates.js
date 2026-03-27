export default async function handler(req, res) {
  const { start_time, end_time, page_size, cursor } = req.query;

  const params = new URLSearchParams();
  if (start_time) params.set("start_time", start_time);
  if (end_time) params.set("end_time", end_time);
  if (page_size) params.set("page_size", page_size);
  if (cursor) params.set("cursor", cursor);

  const upstream = await fetch(
    `https://api.yutori.com/v1/scouting/updates?${params}`,
    {
      headers: {
        "X-API-Key": process.env.YUTORI_API_KEY,
      },
    }
  );

  const data = await upstream.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
  res.status(upstream.status).json(data);
}
