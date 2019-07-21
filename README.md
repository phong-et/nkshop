"# nkshop" 

# Features in Future

- Server RESTful API to fetch, statistic product by multi-conditions
- Client Single Page to view, filter, statistic product
- Server GraphQL to insert delete update product, review

# Server RESTful API

- fetchProductByPriceAndReviewCount 
    - input range of page to statistic
    - data json return :
        ```js
        {
            productId:1234,
            Price:'100$',
            ratringCount:5
            title:'Product title'
        }
        ``` 

# Server GraphQL

# Knowledge

# Bypass cloudflare JS challenge (Vượt qua cơ chế anti-bot của CloudFlare)
    - Cơ chế hoạt động của nó như sau:
        - Khi vào lần đầu tiên (A – trang gốc), bạn được trả lại trang challenge với một đoạn mã JS
        - Browser sẽ phải execute đoạn mã và tính ra 1 con số kết quả
        - Sau timeout là 5s, trang sẽ gửi kết quả tính được tới 1 trang xác nhận B
        - Nếu kết quả chuẩn, browser sẽ nhận được từ request tới B một cookie tên là “cf_clearance”, đồng thời trên header của response sẽ redirect lại trang gốc A
        - Lúc này do đã có cookie cf_clearance, nội dung đầy đủ sẽ được trả về
        - Cookie sẽ hết hạn sau khoảng ~10 hours
    - Mô phỏng các phương trình   
        - Thay thế ‘!+[]’, ‘+!![]’, ‘+![]’ thành giá trị +1
        - Thay thế ‘+[]’ thành giá trị +0
        - Dấu cộng giữa 2 ngoặc đơn ‘)+(‘ là phép nối chuỗi (trong PHP là “.”, trong C++ là &)
        - Dấu ‘)/+(‘ giữa 2 ngoặc đơn là phép chia