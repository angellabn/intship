const db = require("../db");

exports.createCategory = (req, res) => {

  const { category_name, description } = req.body;

  const sql = `
  INSERT INTO categories
  (category_name, description, created_at, updated_at, status)
  VALUES (?, ?, NOW(), NOW(), true)
  `;

  db.query(sql, [category_name, description], (err, result) => {

    if (err) {
      return res.send(err);
    }

    res.send("Category created");

  });

};



exports.getCategories = (req, res) => {

  const sql = `
  SELECT *
  FROM categories
  WHERE status = true
  `;

  db.query(sql, (err, result) => {

    if (err) {
      return res.send(err);
    }

    res.json(result);

  });

};



exports.updateCategory = (req, res) => {

  const id = req.params.id;

  const { category_name, description } = req.body;

  const sql = `
  UPDATE categories
  SET category_name=?, description=?, updated_at=NOW()
  WHERE category_id=?
  `;

  db.query(sql, [category_name, description, id], (err) => {

    if (err) {
      return res.send(err);
    }

    res.send("Category updated");

  });

};



exports.deleteCategory = (req, res) => {

  const id = req.params.id;

  const sql = `
  UPDATE categories
  SET status=false
  WHERE category_id=?
  `;

  db.query(sql, [id], (err) => {

    if (err) {
      return res.send(err);
    }

    res.send("Category deleted");

  });

};