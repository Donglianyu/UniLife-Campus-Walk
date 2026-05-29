# 移动端和其它设备运行说明

## 本机运行

进入 `backend`：

```bash
npm install
npm start
```

电脑本机打开：

```text
http://127.0.0.1:3000/login
```

## 同一 Wi-Fi 的手机运行

手机不能打开 `127.0.0.1`，因为那代表手机自己。

请在电脑上查看局域网 IP，然后手机打开：

```text
http://电脑局域网IP:3000/login
```

Windows 可以用：

```powershell
ipconfig
```

查找类似 `192.168.x.x` 的 IPv4 地址。

## 不同网络的手机运行

如果手机使用 5G，或者不和电脑在同一个 Wi-Fi，需要公网服务器。

把整个项目上传到服务器后：

```bash
cd backend
npm install
npm start
```

手机打开：

```text
http://服务器公网IP:3000/login
```

如果要稳定 HTTPS：

```text
https://你的域名/login
```

这需要域名、Nginx 反向代理和 SSL 证书。临时隧道只能测试，不适合长期提交或展示。

## 数据库导入顺序

默认运行不需要 MySQL。如果要使用数据库包：

```bash
mysql -u root -p < database/unilife_campus_walk_uic_map.sql
mysql -u root -p < database/latest_game_content_patch.sql
mysql -u root -p < database/enhanced_event_schedule.sql
```

## 默认玩法更新

- Sleep / End Day 后 fatigue 减少当前的 50%。
- required 任务出现时，玩家可以做别的活动，但会弹出旷课/跳过后果。
- 新增隐藏地点：Artificial Lake Dock、Campus Plaza、Old Village Workshop。
- 当前版本：23 个地点、8 个 NPC、92 个活动。
