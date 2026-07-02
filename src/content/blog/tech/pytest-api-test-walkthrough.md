---
title: '接口自动化项目复盘：从 pytest 命令到每一层代码'
description: '梳理 web-interface-test 项目的分层架构，以 test_login.py 为例，讲清 conftest、config_loader、token 缓存与 fixture 的完整调用链。'
pubDate: 2026-06-16
category: tech
tags: [pytest, 接口自动化, python, 测试]
---

## 背景

最近重新翻看本地的接口自动化项目 `web-interface-test`（Pytest + Requests + Jenkins）。这篇文章把复盘过程中搞懂的内容整理下来，以一条最常见的命令为线索：

```bash
cd /Users/xuebing/PycharmProjects/web-interface-test
source venv/bin/activate
python3 -m pytest tests/user/test_login.py --env=test -v -s
```

---

## 项目分层

```
命令行 --env=test
       ↓
conftest.py（环境变量、session fixture）
       ↓
config/config_{env}.yaml（URL、账号、headers）
       ↓
tests/（用例 + 断言）
       ↓
api/（接口封装：URL、headers、payload）
       ↓
utils/（配置加载、token 缓存、HTTP 工具）
       ↓
requests → 测试环境 HTTP API
```

| 目录/文件 | 作用 |
|-----------|------|
| `conftest.py` | 注册 `--env`、设置 `ENV` 环境变量、提供 session 级 token 和 autouse 前置 |
| `config/config_test.yaml` | 测试环境 base_url、账号、公共 headers |
| `utils/config_loader.py` | 按 `ENV` 读取 YAML，内存缓存 |
| `utils/token_manager.py` | 登录拿 token，内存 + 文件双层缓存 |
| `utils/request_handler.py` | 统一 HTTP 请求（重试、注入 token、合并 headers） |
| `api/api_user.py` | 登录接口封装 |
| `tests/user/test_login.py` | 登录场景测试用例 |

---

## config_loader 是 pytest 官方推荐吗？

**不是。** pytest 没有规定配置文件必须怎么加载。官方提供的是 `conftest.py`、fixture、`pytest_addoption`、`pytest.ini` 等机制。

`load_config()` 是一个普通 Python 函数 + 模块级缓存：

```python
_config = None

def load_config():
    global _config
    if _config is not None:
        return _config
    env = os.getenv("ENV", "test")
    config_path = f"config/config_{env}.yaml"
    with open(config_path, encoding="utf-8") as f:
        _config = yaml.safe_load(f)
    return _config
```

这样做**合理且常见**：任意模块（api、utils、测试）都能调用，不绑定 pytest 生命周期；`_config` 缓存避免重复读文件。

更「pytest 味」的写法是把配置做成 `@pytest.fixture(scope="session")`，通过参数注入。小项目用环境变量 + 工具函数更省事。

---

## conftest.py 和 config_loader.py 有什么区别？

这是两个不同层次的东西：

| | `conftest.py` | `utils/config_loader.py` |
|--|---------------|---------------------------|
| 性质 | pytest 专用 | 普通工具模块 |
| 谁调用 | pytest 框架自动调用 hook/fixture | 业务代码手动调用 `load_config()` |
| 职责 | 注册 `--env`、设环境变量、提供 fixture | 按 `ENV` 读 YAML、缓存配置 |
| 是否依赖 pytest | 是 | 否 |
| 知道 `--env` 吗 | 知道 | 不知道，只看 `os.getenv("ENV")` |

衔接关系：

```
命令行 --env=test
    ↓  pytest_configure（conftest.py）
os.environ["ENV"] = "test"
    ↓  load_config()（config_loader.py）
读取 config/config_test.yaml
```

**时间顺序**：`pytest_configure` 先执行；`load_config()` 在第一次有人需要配置时才执行（lazy load）。

`pytest_configure` 代码：

```python
def pytest_configure(config):
    env = config.getoption("--env")
    os.environ["ENV"] = env
```

如果不用 `pytest_configure`，`load_config()` 会走默认值 `os.getenv("ENV", "test")`，命令行的 `--env=prod` 就不会生效，除非手动 `export ENV=prod`。

---

## request_handler 为什么要合并 header？

```python
base_headers = config["base"]["headers"].copy()
token = get_token(user_type)
base_headers["authorization"] = f"Bearer {token}"
custom_headers = kwargs.pop("headers", {})
headers = {**base_headers, **custom_headers}
```

三层叠加，后者覆盖前者：

1. YAML 里的公共头（app-code、referer、origin…）
2. 自动注入 Bearer token
3. 调用方传入的 headers（可覆盖上面任意字段）

**设计意图**：公共头只维护一份；鉴权统一注入；个别接口可以 override。

**实际情况**：项目里两套风格并存——

- 早期：`tests/` 里直接调 `send_request`
- 后期：`api/` 里用 `requests` 或 `robust_send_request`，自己在 `__init__` 里拼 headers

跑 `test_login.py` 时**不会**用到 `request_handler`，登录走的是 `api/api_user.py` 里的 `requests.post`。

---

## 本地怎么跑测试

### 准备

```bash
cd /Users/xuebing/PycharmProjects/web-interface-test
python3 -m venv venv          # 首次
source venv/bin/activate
pip install -r requirements.txt
cp config/config_test.yaml.example config/config_test.yaml  # 首次，填账号
```

### 常用命令

```bash
# 和 Jenkins 一致：跑登录文件
pytest tests/user/test_login.py --env=test -v -s

# 只跑一条，最快验证环境
pytest tests/user/test_login.py::test_login_success --env=test -v -s

# 生成 Allure 原始数据
pytest tests/user/test_login.py --env=test -v -s --alluredir=allure-results
```

| 参数 | 含义 |
|------|------|
| `--env=test` | 测试环境，读 `config_test.yaml` |
| `-v` | 显示用例名 |
| `-s` | 显示 print / DEBUG 日志 |

注意：`conftest.py` 里有 `autouse` 的 `prepare_audio_filters`，即使只跑登录也会先拉一次 audio filter（多 2～4 秒）。token 缓存在 `data/token_cache.json`，过期可删掉重跑。

---

## Jenkins 跑的是什么？

Jenkinsfile 里「接口测试」阶段的命令：

```bash
venv/bin/python3 -m pytest tests/user/test_login.py \
    --env=test -v -s \
    --alluredir=${WORKSPACE}/allure-results
```

- **环境**：`--env=test`，打测试 API（如 `api-xxx.com`）
- **范围**：只跑 `test_login.py`，不是全量
- **配置**：从本机路径复制 `config_test.yaml` 到 workspace

本地 `run_tests.sh` 与 Jenkins 基本一致，只是 allure 目录用相对路径。

---

## 一条 pytest 命令的完整调用链

以 `pytest tests/user/test_login.py --env=test -v -s` 为例。

### 阶段 1：pytest 启动

| 模块 | 作用 |
|------|------|
| `pytest` | 测试运行器 |
| `pytest.ini` | 默认 `--disable-warnings`，忽略 urllib3 SSL 告警 |
| `conftest.py` | import 时连带加载 `token_manager`、`audio_filter_utils` |

### 阶段 2：配置环境

`pytest_configure` 把 `--env=test` 写入 `os.environ["ENV"]`。

### 阶段 3：Session 级 fixture（4 条用例之前，只执行一次）

**`login_token`** → `get_token("user")`：

```
查 _token_cache（内存 dict，在 token_manager.py 顶部）
    ↓ 没有
查 data/token_cache.json（文件）
    ↓ 没有
load_config() → APIUser().login() → 写回内存 + 文件
```

**`prepare_audio_filters`（autouse）** → 即使用例是登录也会执行：

```
save_audio_filters_yaml(token)
  → AudioFilterApi.get_audio_filters()
  → POST .../filters/audio
  → 写入 data/audio_filters_response.json / .yaml
```

给后面 video_task 用例准备 label 数据；跑登录时是「顺带的全局前置」。

### 阶段 4：执行 test_login.py 里的 4 条用例

**`user_credentials` fixture**（`scope="module"`，整个文件只执行一次）：

```python
@pytest.fixture(scope="module")
def user_credentials():
    config = load_config()
    return config["user"]["email"], config["user"]["password"]
```

只有参数里写了 `user_credentials` 的用例会触发；前 2 条共用一份返回值，后 2 条不需要。

**执行顺序**（默认按文件定义顺序）：

| 顺序 | 用例 | 账号来源 | 测什么 |
|------|------|----------|--------|
| ① | `test_login_success` | YAML（fixture） | 正确登录有 token |
| ② | `test_login_wrong_password` | YAML email + 硬编码错误密码 | 密码错误提示 |
| ③ | `test_login_missing_email` | 硬编码空邮箱 | 空邮箱提示 |
| ④ | `test_login_invalid_email_format` | 硬编码非法邮箱 | 格式错误 |

单条用例内部（以 `test_login_success` 为例）：

```
pytest 注入 user_credentials
    → email, password = user_credentials
    → APIUser()  → load_config() 拿 base_url
    → client.login(email, password)  → requests.post(.../simpleUser/login)
    → assert 响应字段
```

**重要**：`get_token()` 和用例里的 `APIUser().login()` 是两条线。fixture 为 filter 前置准备 token（有缓存）；用例仍各自调登录接口做断言。

### 典型情况下的接口调用次数

假设 `token_cache.json` 已有有效 token：

| 调用 | 接口 |
|------|------|
| `prepare_audio_filters` | filter × 1 |
| 4 条登录用例 | login × 4 |

合计 **1 次 filter + 4 次登录**（无 token 缓存时再多 1 次登录）。

### 本次命令不会调用的模块

- `utils/request_handler.py`
- `utils/data_loader.py`
- `api/api_video_task.py` 等

---

## _token_cache 存在哪里？

```python
# utils/token_manager.py
_token_cache = {}
_token_file = "./data/token_cache.json"
```

| 层级 | 位置 | 生命周期 |
|------|------|----------|
| 内存 | `_token_cache` 字典，键如 `"user"` | 当前 pytest 进程结束即消失 |
| 文件 | `data/token_cache.json` | 跨进程保留 |

同一次 pytest 里第二次 `get_token("user")` 会打印「从内存缓存中获取 token」，不再调登录。

---

## 两张时序总图

### 从命令到配置

```
pytest ... --env=test
├─ pytest_addoption        注册 --env
├─ pytest_configure        ENV = "test"
├─ login_token → get_token → load_config（首次）
├─ prepare_audio_filters → AudioFilterApi → load_config（缓存）
├─ user_credentials → load_config（缓存）
└─ 4 × test_xxx → APIUser().login()
```

### fixture 作用域

```
[Session]  login_token, prepare_audio_filters     ← 整个 pytest 一次
[Module]   user_credentials                       ← test_login.py 一次
[Function] （本文件无 function 级 fixture）      ← 每条用例
```

---

## 后续可以改进的点

面试或继续维护时，这些是可说的「已知债」：

1. **`member_token` 和 `login_token` 都调 `get_token("user")`** — 应区分 member / non_member
2. **两套用例风格并存** — 早期 test 里直接 `send_request`，后期 `api/` 封装；应收敛到 api 层
3. **`autouse` 全局拉 filter** — 跑登录也执行；可按目录或 marker 触发
4. **Jenkins 只跑 login** — 大量 skip 的用例 CI 覆盖不足；可加 smoke marker
5. **`request_handler` 与 api 层职责重叠** — 测试和 handler 各拼一半 headers，应统一到 api 或 client

---

## 小结

- **`conftest.py`**：pytest 启动时把 `--env` 转成 `ENV`，提供 session fixture
- **`config_loader.py`**：第一次需要配置时读 YAML，与 pytest 解耦
- **`token_manager.py`**：进程内 `_token_cache` + 文件 `token_cache.json` 双层缓存
- **`test_login.py`**：module 级 `user_credentials` 注入账号，4 条用例各自调 `APIUser().login()` 断言

搞清「pytest 钩子 → 环境变量 → 懒加载配置 → fixture 注入 → api 发请求」这条链，再看项目里其他用例会轻松很多。
