## GoJxust API 文档（v0）

说明：所有接口返回统一响应壳：
```json
{
  "StatusCode": 0,
  "StatusMessage": "Success",
  "RequestId": "<trace id>",
  "Result": <具体数据>
}
```

鉴权说明：
- 公开接口：无 Token
- 需认证：`Authorization: Bearer <JWT_TOKEN>`
- 需管理员：在“需认证”的基础上，用户 `role=admin`

基础路径：`/api/v0`

### 健康检查
```http
GET /health
```

### 认证
- 微信登录
```http
POST /api/v0/auth/wechat-login
Content-Type: application/json

Body(dto): request.WechatLoginRequest
{
  "code": "string"
}

Result(dto): response.WechatLoginResponse
{
  "token": "string",
  "user_info": models.User
}
```

### 用户
- 获取当前用户资料（需认证）
```http
GET /api/v0/user/profile
Authorization: Bearer <JWT_TOKEN>

Result: models.User
```

- 更新当前用户资料（需认证）
```http
PUT /api/v0/user/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateProfileRequest
{
  "nickname": "string",
  "avatar": "string",
  "phone": "string",
  "student_id": "string",
  "real_name": "string",
  "college": "string",
  "major": "string",
  "class_id": "string"
}
```

### 评价
- 公开获取教师评价
```http
GET /api/v0/reviews/teacher?teacher_name=xx&page=1&size=10

Result: utils.PageResponse{data=[]models.TeacherReview}
```

- 创建教师评价（需认证）
```http
POST /api/v0/reviews/
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateReviewRequest
{
  "teacher_name": "string",
  "campus": "string",
  "course_name": "string",
  "content": "string(<=200)",
  "attitude": 1 | 2 | 3
}
```

- 获取我的评价记录（需认证）
```http
GET /api/v0/reviews/user?page=1&size=10
Authorization: Bearer <JWT_TOKEN>

Result: utils.PageResponse{data=[]models.TeacherReview}
```

- 管理员获取评价列表（需管理员）
```http
GET /api/v0/reviews/?page=1&size=10&teacher_name=xx&status=1
Authorization: Bearer <JWT_TOKEN>

Result: utils.PageResponse{data=[]models.TeacherReview}
```

- 审核通过（需管理员）
```http
POST /api/v0/reviews/{id}/approve
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): { "admin_note": "string" }
```

- 审核拒绝（需管理员）
```http
POST /api/v0/reviews/{id}/reject
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): { "admin_note": "string(必填)" }
```

- 删除评价（需管理员）
```http
DELETE /api/v0/reviews/{id}
Authorization: Bearer <JWT_TOKEN>
```

### 课程表（需认证）
- 获取用户课程表
```http
GET /api/v0/coursetable?semester=2024-2025-1

Result(dto): response.CourseTableResponse
{
  "class_id": "string",
  "semester": "string",
  "course_data": "json"
}
```

- 搜索班级
```http
GET /api/v0/coursetable/search?keyword=xx&page=1&size=10

Result(dto): response.SearchClassResponse
{
  "list": [{"class_id":"string","semester":"string"}],
  "total": 0,
  "page": 1,
  "size": 10
}
```

- 更新用户班级
```http
PUT /api/v0/coursetable/class
Content-Type: application/json

Body(dto): request.UpdateUserClassRequest
{ "class_id": "string" }
```

- 编辑个人课表单个格子
```http
PUT /api/v0/coursetable
Content-Type: application/json

Body(dto): request.EditCourseCellRequest
{
  "semester": "string",
  "index": "1-35",
  "value": { ... 任意JSON ... }
}
```

### 挂科率（需认证）
- 搜索
```http
GET /api/v0/failrate/search?keyword=xx&page=1&size=10

Result(dto): response.FailRateListResponse
{
  "list": [{"id":1,"course_name":"","department":"","semester":"","failrate":0}],
  "total": 0,
  "page": 1,
  "size": 10
}
```

- 随机10
```http
GET /api/v0/failrate/rand

Result(dto): response.FailRateListResponse
{
  "list": [ ... 同上 ... ]
}
```

### Hero
- 公开列表（全部，按 sort 升序，仅显示 is_show=true 的英雄）
```http
GET /api/v0/heroes/

Result: []string
```

- 搜索英雄（需管理员，支持分页）
```http
GET /api/v0/heroes/search?q=搜索关键词&is_show=true&page=1&size=10
Authorization: Bearer <JWT_TOKEN>

Parameters:
- q: 搜索关键词（可选，空则返回全部）
- is_show: 是否显示过滤（可选，true/false）
- page: 页码，默认1
- size: 每页条数，默认10

Result: response.PageResponse
{
  "data": [
    {
      "id": 1,
      "name": "英雄名称",
      "sort": 0,
      "is_show": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "size": 10
}
```

- 创建（需管理员）
```http
POST /api/v0/heroes/
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateHeroRequest
{ "name": "string", "sort": 0, "is_show": true }
```

- 更新（需管理员）
```http
PUT /api/v0/heroes/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateHeroRequest
{ "name": "string", "sort": 0, "is_show": true }
```

- 删除（需管理员）
```http
DELETE /api/v0/heroes/{id}
Authorization: Bearer <JWT_TOKEN>
```

### 系统配置
- 公开读取
```http
GET /api/v0/configs/{key}

Result: { "key": "string", "value": "string", "value_type": "string", "description": "string" }
```

- 搜索配置项（需管理员，支持分页）
```http
GET /api/v0/config/search?q=搜索关键词&page=1&size=10
Authorization: Bearer <JWT_TOKEN>

Parameters:
- q: 搜索关键词（可选，空则返回全部，支持按key和description搜索）
- page: 页码，默认1
- size: 每页条数，默认10

Result: response.PageResponse
{
  "data": [
    {
      "id": 1,
      "key": "config_key",
      "value": "config_value",
      "value_type": "string",
      "description": "配置描述",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "size": 10
}
```

- 创建（需管理员）
```http
POST /api/v0/config/
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateConfigRequest
{ "key":"string","value":"string","value_type":"string|number|boolean|json","description":"string" }
```

- 更新（需管理员）
```http
PUT /api/v0/config/{key}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateConfigRequest
{ "value":"string","value_type":"string|number|boolean|json","description":"string" }
```

- 删除（需管理员）
```http
DELETE /api/v0/config/{key}
Authorization: Bearer <JWT_TOKEN>
```

### 存储相关(需认证)

#### 获取文件URL
```http
GET /api/v0/store/{resource_id}/url
Authorization: Bearer <JWT_TOKEN>
```

#### 获取文件流
```http
GET /api/v0/store/{resource_id}/stream
Authorization: Bearer <JWT_TOKEN>
```

#### 上传文件（管理员）
```http
POST /api/v0/store
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

# Body is form-data
# file: (binary)
# tags: {"key": "value"}
```

**Example using curl:**
```bash
curl -X POST \
  http://localhost:8085/api/v0/store \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@/path/to/your/file.jpg" \
  -F 'tags={"source":"test-script"}'
```

#### 删除文件（管理员）
```http
DELETE /api/v0/store/{resource_id}
Authorization: Bearer <JWT_TOKEN>
```

#### 获取文件列表（管理员）
```http
GET /api/v0/store/list?page=1&size=10
Authorization: Bearer <JWT_TOKEN>
```

#### 获取过期文件列表（管理员）
```http
GET /api/v0/store/expired?page=1&size=10
Authorization: Bearer <JWT_TOKEN>
```

### 通知管理

#### 创建通知（运营专用）
```http
POST /api/v0/notifications
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateNotificationRequest
{
  "title": "string(max=200)",
  "content": "string",
  "categories": [1, 2, 3]
}

Result(dto): response.NotificationResponse
```

#### 获取通知列表（公开）
```http
GET /api/v0/notifications?page=1&size=20&categories=1,2&status=3&keyword=搜索关键词

Parameters:
- page: 页码，默认1
- size: 每页数量，默认20，最大100
- categories: 分类ID数组过滤
- status: 状态过滤（1=草稿，2=待审核，3=已发布，4=已删除）
- keyword: 关键词搜索

Result(dto): utils.PageResponse{data=[]response.NotificationSimpleResponse}
```

#### 获取通知详情（公开）
```http
GET /api/v0/notifications/{id}

Result(dto): response.NotificationResponse
```

#### 更新通知（运营专用）
```http
PUT /api/v0/notifications/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateNotificationRequest
{
  "title": "string(max=200)",
  "content": "string",
  "categories": [1, 2, 3]
}

Result(dto): response.NotificationResponse
```

#### 发布通知（运营专用）
```http
POST /api/v0/notifications/{id}/publish
Authorization: Bearer <JWT_TOKEN>

Result: {"message": "通知发布成功"}
```

#### 转换通知为日程（需认证）
```http
POST /api/v0/notifications/{id}/convert-to-schedule
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.ConvertToScheduleRequest
{
  "title": "string",
  "description": "string",
  "time_slots": [
    {
      "name": "string",
      "start_date": "2024-01-01",
      "end_date": "2024-01-02",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_all_day": false
    }
  ]
}

Result: {"message": "转换为日程成功"}
```

#### 删除通知（运营专用）
```http
DELETE /api/v0/notifications/{id}
Authorization: Bearer <JWT_TOKEN>

Result: {"message": "通知删除成功"}
```

#### 审核通知（管理员专用）
```http
POST /api/v0/notifications/{id}/approve
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.ApproveNotificationRequest
{
  "status": 1 | 2,
  "note": "string(max=500)"
}

Result: {"message": "审核完成"}
```

#### 获取管理员通知列表（管理员专用）
```http
GET /api/v0/notifications/admin?page=1&size=20&categories=1,2&status=2&keyword=搜索关键词
Authorization: Bearer <JWT_TOKEN>

Parameters: 同获取通知列表

Result(dto): utils.PageResponse{data=[]response.NotificationSimpleResponse}
```

#### 获取管理员通知详情（管理员专用）
```http
GET /api/v0/notifications/admin/{id}
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.NotificationResponse
```

#### 创建通知分类（管理员专用）
```http
POST /api/v0/notifications/categories
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateCategoryRequest
{
  "name": "string(max=20)",
  "sort": 0,
  "is_active": true
}

Result(dto): response.NotificationCategoryResponse
```

#### 获取通知分类列表（公开）
```http
GET /api/v0/notifications/categories

Result: []response.NotificationCategoryResponse
```

#### 更新通知分类（管理员专用）
```http
PUT /api/v0/notifications/categories/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateCategoryRequest
{
  "name": "string(max=20)",
  "sort": 0,
  "is_active": true
}

Result(dto): response.NotificationCategoryResponse
```

**示例:**
```bash
# 创建通知
curl -X POST \
  http://localhost:8085/api/v0/notifications \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "期末考试安排通知",
    "content": "各位同学请注意，期末考试将于下周开始...",
    "categories": [1, 2]
  }'

# 获取通知列表
curl -X GET \
  "http://localhost:8085/api/v0/notifications?page=1&size=10&categories=1"

# 发布通知
curl -X POST \
  http://localhost:8085/api/v0/notifications/1/publish \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 用户投稿

#### 创建投稿（需认证）
```http
POST /api/v0/contributions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateContributionRequest
{
  "title": "string(max=200)",
  "content": "string",
  "categories": [1, 2, 3]
}

Result: {"message": "投稿创建成功"}
```

#### 获取投稿列表（需认证）
```http
GET /api/v0/contributions?page=1&size=20&status=1&user_id=123
Authorization: Bearer <JWT_TOKEN>

Parameters:
- page: 页码，默认1
- size: 每页数量，默认20，最大100
- status: 状态过滤（1=待审核，2=已采纳，3=已拒绝）
- user_id: 用户ID过滤（仅管理员可用）

Result(dto): utils.PageResponse{data=[]response.ContributionResponse}
```

#### 获取投稿详情（需认证）
```http
GET /api/v0/contributions/{id}
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.ContributionResponse
```

#### 审核投稿（运营/管理员专用）
```http
POST /api/v0/contributions/{id}/review
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.ReviewContributionRequest
{
  "status": 2 | 3,
  "review_note": "string(max=500)",
  "points": 50,
  "title": "string(max=200)",
  "content": "string",
  "categories": [1, 2, 3]
}

Result: {"message": "投稿审核完成"}
```

#### 获取用户投稿统计（需认证）
```http
GET /api/v0/contributions/stats
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.ContributionStatsResponse
{
  "total_count": 10,
  "pending_count": 3,
  "approved_count": 5,
  "rejected_count": 2,
  "total_points": 150
}
```

**示例:**
```bash
# 创建投稿
curl -X POST \
  http://localhost:8085/api/v0/contributions \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学期期末复习指南",
    "content": "分享一些期末复习的心得和方法...",
    "categories": [1]
  }'

# 获取我的投稿列表
curl -X GET \
  "http://localhost:8085/api/v0/contributions?page=1&size=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# 审核投稿（管理员）
curl -X POST \
  http://localhost:8085/api/v0/contributions/1/review \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2,
    "review_note": "内容质量很好，采纳发布",
    "points": 50,
    "title": "学期期末复习指南",
    "content": "分享一些期末复习的心得和方法...",
    "categories": [1]
  }'
```

### 倒数日管理

#### 创建倒数日（需认证）
```http
POST /api/v0/countdowns
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateCountdownRequest
{
  "title": "string(max=100)",
  "description": "string",
  "target_date": "2024-06-15"
}

Result(dto): response.CountdownResponse
```

#### 获取用户倒数日列表（需认证）
```http
GET /api/v0/countdowns
Authorization: Bearer <JWT_TOKEN>

Result: []response.CountdownResponse
```

#### 获取倒数日详情（需认证）
```http
GET /api/v0/countdowns/{id}
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.CountdownResponse
```

#### 更新倒数日（需认证）
```http
PUT /api/v0/countdowns/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateCountdownRequest
{
  "title": "string(max=100)",
  "description": "string",
  "target_date": "2024-06-15"
}

Result(dto): response.CountdownResponse
```

#### 删除倒数日（需认证）
```http
DELETE /api/v0/countdowns/{id}
Authorization: Bearer <JWT_TOKEN>

Result: {"message": "倒数日删除成功"}
```

**示例:**
```bash
# 创建倒数日
curl -X POST \
  http://localhost:8085/api/v0/countdowns \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "期末考试",
    "description": "高等数学期末考试",
    "target_date": "2024-06-15"
  }'

# 获取我的倒数日列表
curl -X GET \
  http://localhost:8085/api/v0/countdowns \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# 更新倒数日
curl -X PUT \
  http://localhost:8085/api/v0/countdowns/1 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "高等数学期末考试",
    "description": "复习重点：微积分、线性代数",
    "target_date": "2024-06-15"
  }'

# 删除倒数日
curl -X DELETE \
  http://localhost:8085/api/v0/countdowns/1 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 学习清单（学习任务）

#### 创建学习任务（需认证）
```http
POST /api/v0/study-tasks
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.CreateStudyTaskRequest
{
  "title": "string(max=200)",
  "description": "string",
  "due_date": "2024-06-15",
  "priority": 1 | 2 | 3
}

Result(dto): response.StudyTaskResponse
```

#### 获取学习任务列表（需认证）
```http
GET /api/v0/study-tasks?page=1&size=20&status=1&priority=1&keyword=搜索关键词
Authorization: Bearer <JWT_TOKEN>

Parameters:
- page: 页码，默认1
- size: 每页数量，默认20，最大100
- status: 状态过滤（1=待完成，2=已完成）
- priority: 优先级过滤（1=高，2=中，3=低）
- keyword: 关键词搜索

Result(dto): utils.PageResponse{data=[]response.StudyTaskResponse}
```

#### 获取学习任务详情（需认证）
```http
GET /api/v0/study-tasks/{id}
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.StudyTaskResponse
```

#### 更新学习任务（需认证）
```http
PUT /api/v0/study-tasks/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body(dto): request.UpdateStudyTaskRequest
{
  "title": "string(max=200)",
  "description": "string",
  "due_date": "2024-06-15",
  "priority": 1 | 2 | 3,
  "status": 1 | 2
}

Result(dto): response.StudyTaskResponse
```

#### 删除学习任务（需认证）
```http
DELETE /api/v0/study-tasks/{id}
Authorization: Bearer <JWT_TOKEN>

Result: {"message": "学习任务删除成功"}
```

#### 获取学习任务统计（需认证）
```http
GET /api/v0/study-tasks/stats
Authorization: Bearer <JWT_TOKEN>

Result(dto): response.StudyTaskStatsResponse
{
  "total_count": 20,
  "pending_count": 8,
  "completed_count": 12
}
```

#### 获取已完成任务（历史记录）（需认证）
```http
GET /api/v0/study-tasks/completed?page=1&size=20
Authorization: Bearer <JWT_TOKEN>

Parameters:
- page: 页码，默认1
- size: 每页数量，默认20，最大100

Result(dto): utils.PageResponse{data=[]response.StudyTaskResponse}
```

**示例:**
```bash
# 创建学习任务
curl -X POST \
  http://localhost:8085/api/v0/study-tasks \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "复习高等数学第三章",
    "description": "重点复习微分方程的求解方法",
    "due_date": "2024-06-10",
    "priority": 1
  }'

# 获取学习任务列表
curl -X GET \
  "http://localhost:8085/api/v0/study-tasks?page=1&size=10&status=1&priority=1" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# 更新学习任务（标记为完成）
curl -X PUT \
  http://localhost:8085/api/v0/study-tasks/1 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2
  }'

# 获取学习任务统计
curl -X GET \
  http://localhost:8085/api/v0/study-tasks/stats \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# 获取已完成任务列表
curl -X GET \
  "http://localhost:8085/api/v0/study-tasks/completed?page=1&size=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

## 数据模型说明

### 通知状态 (NotificationStatus)
- `1` - 草稿
- `2` - 待审核  
- `3` - 已发布
- `4` - 已删除

### 通知审核状态 (NotificationApprovalStatus)  
- `1` - 同意
- `2` - 拒绝

### 投稿状态 (UserContributionStatus)
- `1` - 待审核
- `2` - 已采纳
- `3` - 已拒绝

### 学习任务状态 (StudyTaskStatus)
- `1` - 待完成
- `2` - 已完成

### 学习任务优先级 (StudyTaskPriority)
- `1` - 高优先级
- `2` - 中优先级  
- `3` - 低优先级

### 响应数据结构

#### 通知响应 (NotificationResponse)
```json
{
  "id": 1,
  "title": "期末考试安排通知",
  "content": "各位同学请注意，期末考试将于下周开始...",
  "publisher_id": 10,
  "publisher_type": 1,
  "publisher": {
    "id": 10,
    "nickname": "管理员"
  },
  "contributor_id": null,
  "contributor": null,
  "categories": [
    {
      "id": 1,
      "name": "学术通知",
      "sort": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "status": 3,
  "schedule": null,
  "view_count": 156,
  "published_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T09:30:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### 投稿响应 (ContributionResponse)
```json
{
  "id": 1,
  "user_id": 123,
  "user": {
    "id": 123,
    "nickname": "学生用户"
  },
  "title": "学期期末复习指南",
  "content": "分享一些期末复习的心得和方法...",
  "categories": [
    {
      "id": 1,
      "name": "学习资料",
      "sort": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "status": 2,
  "reviewer_id": 10,
  "reviewer": {
    "id": 10,
    "nickname": "管理员"
  },
  "review_note": "内容质量很好，采纳发布",
  "notification_id": 15,
  "notification": {
    "id": 15,
    "title": "学期期末复习指南",
    "categories": [...],
    "status": 3,
    "view_count": 89,
    "published_at": "2024-01-16T14:00:00Z",
    "created_at": "2024-01-16T14:00:00Z"
  },
  "points_awarded": 50,
  "reviewed_at": "2024-01-16T14:00:00Z",
  "created_at": "2024-01-15T16:30:00Z",
  "updated_at": "2024-01-16T14:00:00Z"
}
```

#### 倒数日响应 (CountdownResponse)
```json
{
  "id": 1,
  "user_id": 123,
  "title": "期末考试",
  "description": "高等数学期末考试",
  "target_date": "2024-06-15T00:00:00Z",
  "created_at": "2024-01-15T20:00:00Z",
  "updated_at": "2024-01-15T20:00:00Z"
}
```

#### 学习任务响应 (StudyTaskResponse)
```json
{
  "id": 1,
  "user_id": 123,
  "title": "复习高等数学第三章",
  "description": "重点复习微分方程的求解方法",
  "due_date": "2024-06-10T00:00:00Z",
  "priority": 1,
  "status": 1,
  "completed_at": null,
  "days_left": 15,
  "is_overdue": false,
  "created_at": "2024-01-15T21:00:00Z",
  "updated_at": "2024-01-15T21:00:00Z"
}
```