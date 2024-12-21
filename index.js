const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = 3000;



// Cấu hình kết nối đến MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Tên người dùng MySQL (thường là 'root' trên XAMPP)
    password: '', // Mật khẩu MySQL (nếu có)
    database: 'mt_db' // Tên cơ sở dữ liệu đã tạo
});

// Kết nối đến MySQL
db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến MySQL:', err);
        return;
    }
    console.log('Kết nối đến MySQL thành công!');
});


// Bộ nhớ tạm cho lịch sử tính toán
let calcHistory = [];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API lấy toàn bộ lịch sử tính toán
app.get('/api/history', (req, res) => {
    const query = 'SELECT entry FROM history';  // Lấy chỉ trường 'entry' từ bảng 'history'
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn MySQL:', err);
            return res.status(500).json({ message: 'Không thể lấy lịch sử' });
        }
        // Trả về dữ liệu chỉ chứa trường 'entry'
        res.json({ data: results.map(result => result.entry) });
    });
  });

// API thêm một phép tính vào lịch sử
app.post('/api/history', (req, res) => {
  const { entry } = req.body;

  if (!entry) {
      return res.status(400).json({ message: 'Lịch sử không hợp lệ' });
  }

  // Lưu vào MySQL
  const query = 'INSERT INTO history (entry) VALUES (?)';
  db.query(query, [entry], (err, result) => {
      if (err) {
          console.error('Lỗi khi lưu vào MySQL:', err);
          return res.status(500).json({ message: 'Không thể lưu lịch sử' });
      }
      res.json({ message: 'Lịch sử được lưu thành công', id: result.insertId });
  });
});


// API sửa một phép tính trong lịch sử
app.put('/api/history/:id', (req, res) => {
  const { id } = req.params; // ID từ URL
  const { entry } = req.body; // Dữ liệu cập nhật

  if (!entry) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
  }

  // Cập nhật bản ghi trong MySQL
  const query = 'UPDATE history SET entry = ? WHERE id = ?';
  db.query(query, [entry, id], (err, result) => {
      if (err) {
          console.error('Lỗi khi cập nhật MySQL:', err);
          return res.status(500).json({ message: 'Không thể cập nhật lịch sử.' });
      }

      // Kiểm tra xem bản ghi có tồn tại hay không
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Không tìm thấy phép tính.' });
      }

      res.json({ message: 'Sửa phép tính thành công', data: { id, entry } });
  });
});

app.delete('/api/history/:id', (req, res) => {
  const id = req.params.id;

  // Xóa dữ liệu từ MySQL
  const query = 'DELETE FROM history WHERE id = ?';
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Lỗi khi xóa dữ liệu từ MySQL:', err);
          return res.status(500).json({ message: 'Không thể xóa dữ liệu từ MySQL' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Không tìm thấy dữ liệu cần xóa' });
      }

      res.status(200).json({ message: 'Xóa thành công', id });
  });
});


// // API xóa một phép tính trong lịch sử truy xuất từ mảng
// app.delete('/api/history/:id', (req, res) => {
//   const { index } = req.params;
//   if (index < 0 || index >= calcHistory.length) {
//     return res.status(404).json({ message: 'Không tìm thấy phép tính.' });
//   }
//   const entry = calcHistory.splice(index, 1);
//   res.json({ message: 'Xóa phép tính trong lịch sử', data: entry });
// });

// API xóa toàn bộ lịch sử tính toán
app.delete('/api/history', (req, res) => {
  const query = 'DELETE FROM history';
  db.query(query, (err, result) => {
      if (err) {
          console.error('Lỗi khi xóa lịch sử từ MySQL:', err);
          return res.status(500).json({ message: 'Không thể xóa lịch sử' });
      }
      res.json({ message: 'Xóa toàn bộ lịch sử tính toán' });
  });
});


// Lắng nghe tại cổng 3000
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
