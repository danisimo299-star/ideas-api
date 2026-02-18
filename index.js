import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// ВСТАВЬ СВОИ ДАННЫЕ:
const SUPABASE_URL = process.env.SUPABASE_URL; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.get("/", (req, res) => res.json({ ok: true }));

// 1) Получить все идеи
app.get("/ideas", async (req, res) => {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2) Добавить идею
app.post("/ideas", async (req, res) => {
  const { title, description, price } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });

  const { data, error } = await supabase
    .from("ideas")
    .insert([{ title, description: description ?? "", price: price ?? null }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

const port = process.env.PORT || 3000;
app.delete("/ideas/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
});
app.listen(port, () => console.log("Server running on port " + port));