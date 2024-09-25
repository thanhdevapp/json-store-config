# 1. Hướng Dẫn Chạy Ứng Dụng Node.js Qua NPX

## Yêu Cầu

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
- [Node.js](https://nodejs.org/) (bao gồm npm)

Chạy Ứng Dụng Qua NPX

Bây giờ, bạn có thể chạy ứng dụng của mình trực tiếp bằng `npx`. Sử dụng lệnh sau:

```bash
npx json-store-config --port 3001 --data-path ./data
```
## 2. Truy Cập API

Sau khi ứng dụng đang chạy, bạn có thể truy cập API tại địa chỉ:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs) - Tài liệu API Swagger.

Sử dụng các endpoint đã được định nghĩa trong mã nguồn.

## 3. Các Endpoint Có Sẵn

- **POST** `/config-builder` - Tạo dữ liệu mới.
  - **Mẫu JSON**:
    ```json
    {
      "key": "exampleKey",
      "data": {
        "name": "Example Name",
        "description": "Example Description"
      }
    }
    ```

- **GET** `/config-builder/:key` - Lấy tất cả dữ liệu theo key.
  - **Mẫu JSON**:
    ```json
    [
      {
        "versionId": "1",
        "data": {
          "name": "Example Name 1",
          "description": "Example Description 1"
        }
      },
      {
        "versionId": "2",
        "data": {
          "name": "Example Name 2",
          "description": "Example Description 2"
        }
      }
    ]
    ```

- **GET** `/config-builder/:key/latest` - Lấy dữ liệu phiên bản mới nhất.
  - **Mẫu JSON**:
    ```json
    {
      "versionId": "latest",
      "data": {
        "name": "Latest Example Name",
        "description": "Latest Example Description"
      }
    }
    ```

- **GET** `/config-builder/:key/:versionId` - Lấy dữ liệu theo phiên bản.
  - **Mẫu JSON**:
    ```json
    {
      "versionId": "1",
      "data": {
        "name": "Example Name 1",
        "description": "Example Description 1"
      }
    }
    ```

- **DELETE** `/config-builder/:key/:versionId` - Xóa dữ liệu theo phiên bản.
  - **Mẫu JSON**:
    ```json
    {
      "message": "Dữ liệu đã được xóa thành công."
    }
    ```
