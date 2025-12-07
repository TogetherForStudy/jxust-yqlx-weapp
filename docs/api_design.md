# API Request/Response Design:

## Restful API

### 设计原则

对于所有的Restful API接口，遵循以下设计原则：

1. **清晰的资源路径**: 使用名词表示资源，避免动词，符合RESTful风格。
2. **HTTP方法语义明确**: 使用GET、POST、PUT、DELETE等HTTP方法表示操作类型。
3. **版本化接口**: 所有API接口都应包含版本号，便于未来扩展和兼容。
4. **统一的请求和响应格式**: 所有API请求(除GET方法)和响应(除二进制内容输出)都应使用JSON格式，包含必要的状态码和错误信息。
5. **错误处理**: 提供统一的错误响应格式，包含错误码和错误信息，便于前端处理。

### URI

所有API接口的URI应遵循以下格式：

```
/api/<version>/<module-name>/<resources...>
```

- version: API版本号，例如`v0` `v1` `v2`等,现阶段采用`v0`,代表接口处于研发中。
- module-name: 模块名称，例如`user` `order` `product`等。
- resources...: 资源路径，可以是单个资源或资源集合，例如`/user/info`表示用户信息，`/order/list`表示订单列表。

协议总体要求

- 报文统一采用UTF-8编码，**无压缩方式**传输。
- HTTP请求方式：GET/POST/PUT/DELETE
- 请求（非GET）和应答消息（非二进制）的报文体统一采用JSON文本格式。
- JSON报文中的数值型字段，统一按照十进制方式进行序列化处理，浮点内容采用64位浮点

### 请求报文头:

| Header 标识符        | 类型     | 是否必填          | 描述                                                                                                   |
|------------------|--------|---------------|------------------------------------------------------------------------------------------------------|
| Content-Type     | String | 是(对于非GET方法)   | 请求报文体的内容类型，一般要求为：application/json; charset=UTF-8                                                     |
| Content-Type     | String | 否(对于GET方法)    | charset=UTF-8                                                                                        |
| X-Request-ID     | String | 否             | 请求的唯一标识符，用于追踪请求和响应，建议使用UUID格式。如果不填，将由中间件自动生成                                                         |
| X-Idempotency-Key | String | 视接口要求         | 幂等性密钥，用于防止重复提交。仅对写操作(POST/PUT/DELETE/PATCH)有效，GET/HEAD/OPTIONS请求会自动忽略。根据接口配置可能是必填(严格模式)或推荐(宽松模式)     |

### 应答报文头:

| Header 标识符            | 类型     | 是否必填 | 描述                                                       |
|----------------------|--------|------|------------------------------------------------------------|
| Content-Type         | String | 是    | 应答报文体的内容类型，一般要求为：application/json; charset=UTF-8         |
| X-Request-ID         | String | 是    | 返回请求的唯一标识符，与请求头中的X-Request-ID对应                           |
| X-Idempotency-Replayed | String | 否    | 当返回缓存的幂等性响应时，该头会被设置为"true"，表示这是一个重放的响应而非新处理的请求        |

### 应答报文体:

  应答报文体可以为空，客户端此时通过HTTP Response Status来判断接口调用是否正常；如果接口中需要返回数据应答，则应答报文体的内容为标准JSON格式，各个接口的应答报文体的详细定义请参见各个接口中的应答报文体的定义。
  
### 标准请求体要求：

  无，根据各接口的定义要求
  
### 标准响应要求：
  
需要有一个规范的外部结构(提供StatusCode，StatusMessage，RequestId)，然后再返回实际内容（Resutl）：
```json
{
  "StatusCode": 0,
  "StatusMessage": "Success",
  "RequestId": "xxxxxxx",
  "Result": {}
}
```

解释：
  RequestId 为传入的`X-Request-ID`，如果没有传入，则在接口层必须随机生成一个，用于在后续过程中根据日志调试程序

- 若接口一切正常，StatusCode = 0，StatusMessage = Success
- 若业务失败，HTTPCode返回200，StatusCode返回业务错误码，StatusMessage返回错误信息、
- 若找不到，路由需返回HTTPCode404，并返回JSON响应
- 若鉴权失败，路由需返回HTTPCode401，并返回JSON响应
- 若后端异常，HTTPCode返回5xx，此时不要求接口返回json内容

业务码：参照 [模块设计](module_common_design.md)

### 幂等性机制说明

#### X-Idempotency-Key 使用规则

1. **适用场景**：仅对写操作(POST/PUT/DELETE/PATCH)启用幂等性检查，读操作(GET/HEAD/OPTIONS)会自动忽略
2. **工作模式**：
   - **严格模式(Required)**：必须携带`X-Idempotency-Key`，否则返回400错误
   - **宽松模式(Recommended)**：建议携带，如果不携带仅记录警告日志，不影响请求处理
3. **Key格式**：建议使用UUID格式的唯一字符串
4. **缓存范围**：
   - 已认证用户：`user_id` + `idempotency_key`
   - 未认证用户：`client_ip` + `idempotency_key`
5. **有效期**：默认24小时，可根据接口配置自定义TTL
6. **并发控制**：使用分布式锁防止相同Key的并发请求，并发请求会返回409 Conflict
7. **缓存策略**：
   - 仅缓存成功响应(HTTP状态码 < 400)
   - 失败请求不缓存，允许用户重试
   - 命中缓存时返回`X-Idempotency-Replayed: true`响应头

#### X-Request-ID 使用规则

1. **作用**：用于追踪请求在系统中的完整生命周期，便于日志查询和问题排查
2. **生成规则**：
   - 客户端可以在请求头中传入自定义的`X-Request-ID`
   - 如果未传入，中间件会自动生成UUID格式的请求ID
3. **传递机制**：请求ID会在响应的`RequestId`字段中返回，保证请求与响应的对应关系
4. **日志记录**：所有日志都会关联该请求ID，方便追踪问题

#### 使用示例

**创建评论（严格模式）**：
```bash
curl -X POST https://api.example.com/api/v0/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7" \
  -d '{"content": "很好的课程"}'
```

**响应（首次请求）**：
```json
{
  "StatusCode": 0,
  "StatusMessage": "Success",
  "RequestId": "550e8400-e29b-41d4-a716-446655440000",
  "Result": {
    "id": 123,
    "content": "很好的课程"
  }
}
```

**响应（重复请求，命中幂等性缓存）**：
- HTTP头包含 `X-Idempotency-Replayed: true`
- 返回与首次请求完全相同的响应内容
