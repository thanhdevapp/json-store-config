#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const _ = require('lodash');
const setupSwagger = require("./swagger"); // Thêm lodash

const app = express();
const PORT = process.argv[2] || 3000;

const dataFolder = './data';

app.use(cors())
// Middleware để parse JSON từ request
app.use(express.json());

// Kiểm tra folder lưu dữ liệu chính, tạo nếu chưa có
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

// Thiết lập Swagger
setupSwagger(app);


// Hàm để tạo versionId theo định dạng yyyymmddhhmmss
function generateVersionId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
}


// Hàm lấy nội dung file mới nhất trong folder của key
function getLatestFileContent(folderPath) {
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    // Sắp xếp các file theo thứ tự giảm dần (mới nhất trước)
    files.sort((a, b) => b.localeCompare(a));

    if (files.length > 0) {
      const latestFile = files[0]; // File mới nhất
      const latestFilePath = path.join(folderPath, latestFile);
      const content = JSON.parse(fs.readFileSync(latestFilePath, 'utf8'));
      return content;
    }
  }
  return null; // Không có file nào
}

/**
 * @swagger
 * /config-builder/{key}:
 *   get:
 *     summary: Get all data by key
 *     description: Retrieve all data entries for a specified key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key for which to retrieve data.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of data entries
 *       404:
 *         description: Folder or data not found
 */
app.post('/config-builder', (req, res) => {
  const { key, data } = req.body;
  const folderPath = path.join(dataFolder, key);
  const versionId = generateVersionId(); // Tạo version mới
  const fileName = `${versionId}.json`;
  const filePath = path.join(folderPath, fileName);

  // Tạo folder nếu chưa tồn tại
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Lấy nội dung file mới nhất và so sánh với dữ liệu mới
  const latestContent = getLatestFileContent(folderPath);
  if (latestContent && _.isEqual(latestContent.data, data)) {
    return res.status(400).json({ message: 'Dữ liệu đã tồn tại, không có thay đổi' });
  }

  // Lưu dữ liệu vào file trong folder tương ứng
  fs.writeFileSync(filePath, JSON.stringify({ key, data }, null, 2), 'utf8');

  res.status(201).json({ message: 'Dữ liệu đã được lưu', folder: key, versionId });
});

/**
 * @swagger
 * /config-builder/{key}:
 *   get:
 *     summary: Get all data by key
 *     description: Retrieve all data entries for a specified key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key for which to retrieve data.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of data entries
 *       404:
 *         description: Folder or data not found
 */
app.get('/config-builder/:key', (req, res) => {
  const { key } = req.params;
  const folderPath = path.join(dataFolder, key);

  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const data = files.map(file => {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      return { versionId: file.replace('.json', ''), content: JSON.parse(content) };
    });
    console.log(`GET /config-builder/${key}: Trả về ${files.length} phiên bản`);
    res.json(data);
  } else {
    console.log(`GET /config-builder/${key}: Không tìm thấy folder`);
    res.status(404).json({ message: 'Không tìm thấy folder hoặc dữ liệu' });
  }
});

/**
 * @swagger
 * /config-builder/{key}/latest:
 *   get:
 *     summary: Get latest version of data by key
 *     description: Retrieve the latest version of data for a specified key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key for which to retrieve the latest version.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest version of data returned
 *       404:
 *         description: No versions found in folder
 */
app.get('/config-builder/:key/latest', (req, res) => {
  const { key } = req.params;
  const folderPath = path.join(dataFolder, key);

  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    jsonFiles.sort((a, b) => b.localeCompare(a));

    if (jsonFiles.length > 0) {
      const latestFile = jsonFiles[0];
      const filePath = path.join(folderPath, latestFile);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`GET /config-builder/${key}/latest: Phiên bản mới nhất được trả về`);
      res.json({ versionId: latestFile.replace('.json', ''), data });
    } else {
      console.log(`GET /config-builder/${key}/latest: Không có phiên bản nào`);
      res.status(404).json({ message: 'Không có phiên bản nào trong folder' });
    }
  } else {
    console.log(`GET /config-builder/${key}/latest: Không tìm thấy folder`);
    res.status(404).json({ message: 'Không tìm thấy folder' });
  }
});


/**
 * @swagger
 * /config-builder/{key}/{versionId}:
 *   get:
 *     summary: Get data by version
 *     description: Retrieve data for a specific version of a key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key for which to retrieve data.
 *         schema:
 *           type: string
 *       - in: path
 *         name: versionId
 *         required: true
 *         description: The version ID of the data to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data returned successfully
 *       404:
 *         description: Version or folder not found
 */
app.get('/config-builder/:key/:versionId', (req, res) => {
  const { key, versionId } = req.params;
  const filePath = path.join(dataFolder, key, `${versionId}.json`);

  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`GET /config-builder/${key}/${versionId}: Dữ liệu được trả về`);
    res.json(data);
  } else {
    console.log(`GET /config-builder/${key}/${versionId}: Không tìm thấy phiên bản`);
    res.status(404).json({ message: 'Không tìm thấy phiên bản hoặc folder' });
  }
});

/**
 * @swagger
 * /config-builder/{key}/{versionId}:
 *   delete:
 *     summary: Delete data by version
 *     description: Delete a specific version of data for a specified key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key for which to delete data.
 *         schema:
 *           type: string
 *       - in: path
 *         name: versionId
 *         required: true
 *         description: The version ID of the data to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Version deleted successfully
 *       404:
 *         description: Version or folder not found
 */
app.delete('/config-builder/:key/:versionId', (req, res) => {
  const { key, versionId } = req.params;
  const filePath = path.join(dataFolder, key, `${versionId}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`DELETE /config-builder/${key}/${versionId}: Phiên bản đã bị xóa`);
    res.json({ message: 'Phiên bản đã bị xóa' });
  } else {
    console.log(`DELETE /config-builder/${key}/${versionId}: Không tìm thấy phiên bản`);
    res.status(404).json({ message: 'Không tìm thấy phiên bản hoặc folder' });
  }
});

// Liệt kê các endpoint khi khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Tài liệu API có sẵn tại http://localhost:${PORT}/api-docs`);
  console.log('Các endpoint có sẵn:');
  console.log('POST   /config-builder            - Tạo dữ liệu mới');
  console.log('GET    /config-builder/:key       - Lấy tất cả dữ liệu theo key');
  console.log('GET    /config-builder/:key/latest - Lấy dữ liệu phiên bản mới nhất');
  console.log('GET    /config-builder/:key/:versionId - Lấy dữ liệu theo phiên bản');
  console.log('DELETE /config-builder/:key/:versionId - Xóa dữ liệu theo phiên bản');
});
