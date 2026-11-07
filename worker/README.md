# B 站投稿代理 Worker

首页「作品集」板块的实时数据源。把 B 站投稿接口的 WBI 签名、cookie 与风控细节收在一处，前端只认一个干净接口。

**线上地址**：`https://hoooooot-bili-proxy.hoooooot-gem.workers.dev`

> ⚠️ 这个域名在中国大陆被 DNS 污染（解析到 Facebook 的 IP 段），国内访客无法连接。
> 因此前端改成了「快照优先」：先用 `data/videos.json` 渲染，再异步请求本 Worker，
> 连得上才用实时数据覆盖。国内访客走快照（15 分钟一次），海外访客拿实时。
> 想让国内也实时，唯一办法是绑一个托管在 Cloudflare 的自定义域名。

## 为什么需要它

`api.bilibili.com` 的投稿列表接口有两个硬门槛：

1. **不返回 CORS 头** —— 浏览器能发出去，但读不到响应。
2. **强制 WBI 签名 + buvid cookie** —— 缺任一项直接 412，返回的还是 HTML 错误页。

纯静态站绕不过去，必须有一层服务端中转。Worker 免费额度每天 10 万次请求，个人站完全够用。

## 部署

```bash
cd worker
npm install
npx wrangler login          # 浏览器里授权一次（只有 2 分钟窗口，超时重来）
npx wrangler deploy
```

或者不走 OAuth，用 API Token（无时间限制，推荐）：

```bash
CLOUDFLARE_API_TOKEN="$(cat ~/cf_token.txt)" npx wrangler deploy
```

首次部署若报 `You need to register a workers.dev subdomain`，先用 API 注册子域：

```bash
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/subdomain" \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  --data '{"subdomain":"hoooooot-gem"}'
```

部署成功后把地址填进 `js/portfolio.js` 的 `LIVE_ENDPOINT`（结尾不要带斜杠，也不要带 `/videos`）。


## 接口

```
GET /videos?limit=6
```

```json
{
  "ok": true,
  "mid": "3707026240702873",
  "limit": 6,
  "source": "live",
  "updatedAt": "2026-11-07T04:20:00.000Z",
  "videos": [
    {
      "bvid": "BV1xx411c7mD",
      "title": "视频标题",
      "cover": "https://i0.hdslb.com/bfs/archive/xxx.jpg",
      "coverThumb": "https://i0.hdslb.com/bfs/archive/xxx.jpg@480w_270h_1c",
      "url": "https://www.bilibili.com/video/BV1xx411c7mD",
      "pubdate": 1794016800,
      "duration": "03:50",
      "views": 197549
    }
  ]
}
```

`ok: true` 且 `videos` 为空，表示账号当前没有公开投稿，不是抓取失败。
抓取失败时同样返回 HTTP 200，但 `ok: false` 且带 `error` 字段，前端据此走降级。

## 配置

`wrangler.toml` 的 `[vars]`：

| 变量 | 说明 |
|---|---|
| `BILI_MID` | 目标 UP 主 UID，其它 mid 一律 403 |
| `ALLOWED_ORIGINS` | 允许跨域的来源，逗号分隔 |

## 风控与维护

2026-11 实测有效的四件事，缺一即 412：

1. `buvid3` / `buvid4` cookie（`x/frontend/finger/spi` 下发）
2. `dm_img_list`、`dm_img_str`、`dm_cover_img_str`、`dm_img_inter` 四个参数
3. 完整的浏览器指纹头（`sec-ch-ua`、`sec-fetch-*`、`Accept-Language`）
4. WBI 签名：`img_key + sub_key` 经固定表重排取前 32 位作为 mixin key，参数按字典序拼接后 `md5(query + mixinKey)`

WBI key 会轮换，模块内按 5 分钟缓存并自动重取。若某天整站 412，优先检查 B 站是否又加了新参数，而不是签名算法。

登录态下的「仅粉丝可见」视频抓不到，需要在该账号视频的可见性上放开，或另加 `SESSDATA`（不建议，等同于交出账号凭证）。

## 本地调试

```bash
npx wrangler dev
# 另开终端
curl -i 'http://127.0.0.1:8787/videos?limit=6'
```
