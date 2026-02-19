import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ===== Настройки =====
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ===== Работа с путями =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Отдаём статические файлы =====
app.use(express.static(path.join(__dirname, "public")));

// ===== Главная страница =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Временная база (пока без Supabase) =====
let ideas = [];

// Получить все идеи
app.get("/ideas", (req, res) => {
  res.json(ideas);
});

// Добавить идею
app.post("/ideas", (req, res) => {
  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newIdea = {
    id: ideas.length + 1,
    title,
    description,
    price,
    created_at: new Date()
  };

  ideas.push(newIdea);

  res.status(201).json(newIdea);
});

// ===== Запуск сервера =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
