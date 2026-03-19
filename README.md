📦app01  # Django 核心业务应用（用户、书籍、帖子、API、RAG）
 ┣ 📂__pycache__  # Python 解释器自动生成的字节码缓存（可忽略）
 ┃ ┣ 📜__init__.cpython-311.pyc  # __init__.py 的编译缓存
 ┃ ┣ 📜__init__.cpython-313.pyc
 ┃ ┣ 📜admin.cpython-311.pyc  # admin.py 的编译缓存
 ┃ ┣ 📜admin.cpython-313.pyc
 ┃ ┣ 📜api_urls.cpython-311.pyc  # api_urls.py 的编译缓存
 ┃ ┣ 📜api_urls.cpython-313.pyc
 ┃ ┣ 📜api_views.cpython-311.pyc  # api_views.py 的编译缓存
 ┃ ┣ 📜api_views.cpython-313.pyc
 ┃ ┣ 📜apps.cpython-311.pyc  # apps.py 的编译缓存
 ┃ ┣ 📜apps.cpython-313.pyc
 ┃ ┣ 📜forms.cpython-313.pyc  # forms.py 的编译缓存
 ┃ ┣ 📜models.cpython-311.pyc  # models.py 的编译缓存
 ┃ ┣ 📜models.cpython-313.pyc
 ┃ ┣ 📜serializers.cpython-311.pyc  # DRF 序列化器缓存
 ┃ ┣ 📜serializers.cpython-313.pyc
 ┃ ┣ 📜urls.cpython-313.pyc  # urls.py 的编译缓存
 ┃ ┗ 📜views.cpython-313.pyc  # views.py 的编译缓存
 ┃
 ┣ 📂frontend  # 前后端分离：纯前端页面与 JS（通过 API 访问后端）
 ┃ ┣ 📂css  # 前端样式文件
 ┃ ┃ ┗ 📜style.css  # 全站通用 CSS 样式
 ┃ ┣ 📂images  # 前端静态图片资源
 ┃ ┃ ┗ 📜logo-new.png  # 网站 Logo
 ┃
 ┃ ┣ 📂js  # 前端 JavaScript 逻辑（页面行为 + API 调用）-> 一个 html + 一个同名 js
 ┃ ┃ ┣ 📜.DS_Store  # macOS 自动生成文件（可忽略）
 ┃ ┃ ┣ 📜account.js  # 用户个人中心页面逻辑
 ┃ ┃ ┣ 📜add-book-sale.js  # 发布二手书出售信息逻辑
 ┃ ┃ ┣ 📜all-posts.js  # 全部帖子列表页面逻辑
 ┃ ┃ ┣ 📜api.js  # 前端 API 请求统一封装（fetch + token）
 ┃ ┃ ┣ 📜auth.js  # 登录态、权限校验相关逻辑
 ┃ ┃ ┣ 📜book-detail.js  # 单本书籍详情页面逻辑
 ┃ ┃ ┣ 📜books-index.js  # 首页书籍展示逻辑
 ┃ ┃ ┣ 📜books.js  # 书籍相关通用逻辑
 ┃ ┃ ┣ 📜change-password.js  # 修改密码页面逻辑
 ┃ ┃ ┣ 📜components.js  # 可复用前端组件（提示框、卡片等）
 ┃ ┃ ┣ 📜config.js  # 前端全局配置（API_BASE_URL 等）
 ┃ ┃ ┣ 📜create-book.js  # 创建 / 发布书籍逻辑
 ┃ ┃ ┣ 📜create-post.js  # 创建帖子逻辑
 ┃ ┃ ┣ 📜index.js  # 首页入口 JS
 ┃ ┃ ┣ 📜login.js  # 登录页面逻辑
 ┃ ┃ ┣ 📜my-books.js  # 我的书籍列表逻辑
 ┃ ┃ ┣ 📜my-posts.js  # 我的帖子列表逻辑
 ┃ ┃ ┣ 📜post-detail.js  # 帖子详情页面逻辑
 ┃ ┃ ┣ 📜posts.js  # 帖子通用逻辑
 ┃ ┃ ┣ 📜rag_search.js  # 调用后端 RAG 搜索接口
 ┃ ┃ ┣ 📜register.js  # 注册页面逻辑
 ┃ ┃ ┣ 📜search-result.js  # 搜索结果页面逻辑
 ┃ ┃ ┣ 📜search.js  # 搜索输入与跳转逻辑
 ┃ ┃ ┣ 📜tag-posts.js  # 标签筛选帖子逻辑
 ┃ ┃ ┗ 📜upload.js  # 文件 / 图片上传逻辑
 ┃ ┣ 📜.DS_Store  # macOS 自动生成文件（可忽略）
 ┃ ┣ 📜account.html  # 用户个人中心页面
 ┃ ┣ 📜add-book-sale.html  # 发布二手书页面
 ┃ ┣ 📜book-detail.html  # 书籍详情页面
 ┃ ┣ 📜books-index.html  # 书籍首页
 ┃ ┣ 📜books.html  # 书籍列表页面
 ┃ ┣ 📜change-password.html  # 修改密码页面
 ┃ ┣ 📜create-book.html  # 创建书籍页面
 ┃ ┣ 📜create-post.html  # 创建帖子页面
 ┃ ┣ 📜django-app.conf  # Django / 部署相关配置文件
 ┃ ┣ 📜index.html  # 网站首页
 ┃ ┣ 📜login.html  # 登录页面
 ┃ ┣ 📜my-books.html  # 我的书籍页面
 ┃ ┣ 📜my-posts.html  # 我的帖子页面
 ┃ ┣ 📜post-detail.html  # 帖子详情页面
 ┃ ┣ 📜posts.html  # 帖子列表页面
 ┃ ┣ 📜register.html  # 注册页面
 ┃ ┣ 📜search-result.html  # 搜索结果页面
 ┃ ┣ 📜search.html  # 搜索页面
 ┃ ┣ 📜tag-posts.html  # 标签筛选页面
 ┃ ┗ 📜upload.html  # 文件上传页面
 ┃ 
 ┃
 ┣ 📂management  # Django 自定义管理命令
 ┃ ┣ 📂__pycache__  # 管理命令缓存
 ┃ ┃ ┗ 📜__init__.cpython-311.pyc
 ┃ ┣ 📂commands  # 自定义 manage.py 命令目录
 ┃ ┃ ┣ 📂__pycache__  # 命令缓存
 ┃ ┃ ┃ ┣ 📜__init__.cpython-311.pyc
 ┃ ┃ ┃ ┗ 📜index_content.cpython-311.pyc
 ┃ ┃ ┣ 📜__init__.py  # 命令包初始化
 ┃ ┃ ┗ 📜index_content.py  # RAG 索引构建命令（生成向量并写入 ChromaDB）
 ┃ ┗ 📜__init__.py  # management 模块初始化
 ┃ 
 ┣ 📂media  # 用户上传文件存储目录
 ┃ ┗ 📂img  # 上传的图片文件
 ┃ ┃ ┣ 📜1.jpg  # 用户上传图片示例
 ┃ ┃ ┣ 📜1737710994701.jpg
 ┃ ┃ ┣ 📜1739264502164.jpg
 ┃ ┃ ┣ 📜1739264502164_6BxCe2C.jpg
 ┃ ┃ ┣ 📜1f8a9645d688d43feeea24997d1ed21b0ff43ba7.jpg
 ┃ ┃ ┣ 📜2.jpg
 ┃ ┃ ┣ 📜3.jpg
 ┃ ┃ ┣ 📜4cd8f7deb48f8c54476e29503b292df5e1fe7f9e.jpg
 ┃ ┃ ┗ 📜BingWallpaper.jpg
 ┃ 
 ┣ 📂migrations  # Django 数据库迁移文件
 ┃ ┣ 📂__pycache__  # 迁移脚本缓存
 ┃ ┣ 📜0001_initial.py  # 初始数据库表结构
 ┃ ┣ 📜0002_alter_tag_options.py  # 修改 Tag 表配置
 ┃ ┣ 📜0003_book_post_recommended_books_booksale.py  # 新增书籍/帖子/推荐/交易相关表
 ┃ ┗ 📜__init__.py  # migrations 模块初始化
 ┃ 
 ┣ 📂rag  # RAG（检索增强生成）核心模块 
 ┃ ┣ 📂__pycache__  # RAG 模块缓存
 ┃ ┣ 📜__init__.py  # RAG 包初始化
 ┃ ┣ 📜embeddings.py  # 文本转向量（Embedding 模型封装）   🌟
 ┃ ┣ 📜llm_client.py  # 大语言模型调用封装   🌟 目前是本地OLLAMA_MODEL 未来要使用在线模型
 ┃ ┣ 📜prompts.py  # Prompt 模板集中管理   🌟
 ┃ ┣ 📜rag_search.py  # RAG 检索 + 生成主流程   🌟
 ┃ ┗ 📜vector_store.py  # 向量数据库（ChromaDB）操作封装   🌟
 ┃ 
 ┣ 📂templatetags  # Django 模板自定义标签与过滤器
 ┃ ┣ 📂__pycache__  # 模板标签缓存
 ┃ ┣ 📜__init__.py  # templatetags 初始化
 ┃ ┗ 📜cart_filters.py  # 自定义模板过滤器（如价格/数量处理）
 ┃ 
 ┣ 📜.DS_Store  # macOS 自动生成文件（可忽略）
 ┣ 📜__init__.py  # app01 模块初始化
 ┣ 📜admin.py  # Django Admin 后台配置 
 ┣ 📜api_urls.py  # 前端 API 路由定义   🌟
 ┣ 📜api_views.py  # 前端 API 视图函数（JSON 接口）   🌟
 ┣ 📜apps.py  # Django App 配置
 ┣ 📜forms.py  # Django 表单定义
 ┣ 📜models.py  # 数据模型定义（书籍、帖子、用户等）   🌟
 ┣ 📜serializers.py  # DRF 序列化器定义
 ┣ 📜tests.py  # 测试文件（可扩展）
 ┗ 📜urls.py  # 页面路由定义   🌟

📦DjangoProject  # Django 项目级配置目录（只负责“怎么跑”）
 ┣ 📂__pycache__  # 项目配置文件的 Python 字节码缓存
 ┃ ┣ 📜__init__.cpython-311.pyc  # DjangoProject/__init__.py 编译缓存
 ┃ ┣ 📜__init__.cpython-313.pyc
 ┃ ┣ 📜settings.cpython-311.pyc  # settings.py 编译缓存
 ┃ ┣ 📜settings.cpython-313.pyc
 ┃ ┣ 📜urls.cpython-311.pyc  # urls.py 编译缓存
 ┃ ┣ 📜urls.cpython-313.pyc
 ┃ ┣ 📜wsgi.cpython-311.pyc  # wsgi.py 编译缓存
 ┃ ┗ 📜wsgi.cpython-313.pyc
 ┣ 📜.DS_Store  # macOS 自动生成文件（可忽略）
 ┣ 📜__init__.py  # Django 项目包初始化
 ┣ 📜asgi.py  # ASGI 入口（支持异步部署，如 WebSocket）
 ┣ 📜settings.py  # Django 全局配置（数据库、应用、静态文件、RAG 配置等）
 ┣ 📜urls.py  # 项目级 URL 路由分发（转发到 app01）   🌟
 ┗ 📜wsgi.py  # WSGI 入口（传统同步部署，用于 gunicorn / uWSGI）

📦all-MiniLM-L6-v2  # 本地 Sentence-Transformers 向量模型（Embedding 模型）   🌟 本地缓存 模型不是很适配中文，要测试一下
 ┣ 📂.cache  # HuggingFace 模型缓存目录
 ┃ ┗ 📂huggingface
 ┃ ┃ ┣ 📂download  # HuggingFace 下载的模型文件缓存
 ┃ ┃ ┃ ┣ 📂1_Pooling  # 模型池化层配置缓存
 ┃ ┃ ┃ ┃ ┣ 📜config.json.lock  # 配置文件锁
 ┃ ┃ ┃ ┃ ┗ 📜config.json.metadata  # 配置元数据
 ┃ ┃ ┃ ┣ 📂onnx  # ONNX 推理模型缓存（跨平台高性能）
 ┃ ┃ ┃ ┃ ┣ 📜model.onnx.lock
 ┃ ┃ ┃ ┃ ┣ 📜model.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_O1.onnx.lock  # O1 优化版本
 ┃ ┃ ┃ ┃ ┣ 📜model_O1.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_O2.onnx.lock
 ┃ ┃ ┃ ┃ ┣ 📜model_O2.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_O3.onnx.lock
 ┃ ┃ ┃ ┃ ┣ 📜model_O3.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_O4.onnx.lock
 ┃ ┃ ┃ ┃ ┣ 📜model_O4.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_arm64.onnx.lock  # ARM 架构量化模型
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_arm64.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_avx512.onnx.lock  # AVX512 优化模型
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_avx512.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_avx512_vnni.onnx.lock
 ┃ ┃ ┃ ┃ ┣ 📜model_qint8_avx512_vnni.onnx.metadata
 ┃ ┃ ┃ ┃ ┣ 📜model_quint8_avx2.onnx.lock
 ┃ ┃ ┃ ┃ ┗ 📜model_quint8_avx2.onnx.metadata
 ┃ ┃ ┃ ┣ 📂openvino  # OpenVINO 推理模型缓存（Intel 优化）
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model.bin.lock
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model.bin.metadata
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model.xml.lock
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model.xml.metadata
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model_qint8_quantized.bin.lock
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model_qint8_quantized.bin.metadata
 ┃ ┃ ┃ ┃ ┣ 📜openvino_model_qint8_quantized.xml.lock
 ┃ ┃ ┃ ┃ ┗ 📜openvino_model_qint8_quantized.xml.metadata
 ┃ ┃ ┃ ┣ 📜.gitattributes.lock  # Git 属性文件锁
 ┃ ┃ ┃ ┣ 📜.gitattributes.metadata
 ┃ ┃ ┃ ┣ 📜README.md.lock  # 模型说明文件锁
 ┃ ┃ ┃ ┣ 📜README.md.metadata
 ┃ ┃ ┃ ┣ 📜config.json.lock  # 模型配置锁
 ┃ ┃ ┃ ┣ 📜config.json.metadata
 ┃ ┃ ┃ ┣ 📜config_sentence_transformers.json.lock
 ┃ ┃ ┃ ┣ 📜config_sentence_transformers.json.metadata
 ┃ ┃ ┃ ┣ 📜data_config.json.lock
 ┃ ┃ ┃ ┣ 📜data_config.json.metadata
 ┃ ┃ ┃ ┣ 📜model.safetensors.lock  # safetensors 权重锁
 ┃ ┃ ┃ ┣ 📜model.safetensors.metadata
 ┃ ┃ ┃ ┣ 📜modules.json.lock
 ┃ ┃ ┃ ┣ 📜modules.json.metadata
 ┃ ┃ ┃ ┣ 📜pytorch_model.bin.lock  # PyTorch 权重锁
 ┃ ┃ ┃ ┣ 📜pytorch_model.bin.metadata
 ┃ ┃ ┃ ┣ 📜rust_model.ot.lock  # Rust 推理模型锁
 ┃ ┃ ┃ ┣ 📜rust_model.ot.metadata
 ┃ ┃ ┃ ┣ 📜sentence_bert_config.json.lock
 ┃ ┃ ┃ ┣ 📜sentence_bert_config.json.metadata
 ┃ ┃ ┃ ┣ 📜special_tokens_map.json.lock
 ┃ ┃ ┃ ┣ 📜special_tokens_map.json.metadata
 ┃ ┃ ┃ ┣ 📜tf_model.h5.lock  # TensorFlow 模型锁
 ┃ ┃ ┃ ┣ 📜tf_model.h5.metadata
 ┃ ┃ ┃ ┣ 📜tokenizer.json.lock  # tokenizer 锁
 ┃ ┃ ┃ ┣ 📜tokenizer.json.metadata
 ┃ ┃ ┃ ┣ 📜tokenizer_config.json.lock
 ┃ ┃ ┃ ┣ 📜tokenizer_config.json.metadata
 ┃ ┃ ┃ ┣ 📜train_script.py.lock  # 训练脚本锁
 ┃ ┃ ┃ ┣ 📜train_script.py.metadata
 ┃ ┃ ┃ ┣ 📜vocab.txt.lock  # 词表锁
 ┃ ┃ ┃ ┗ 📜vocab.txt.metadata
 ┃ ┃ ┗ 📜.gitignore  # HuggingFace 缓存忽略规则
 ┣ 📂1_Pooling  # 模型池化层定义
 ┃ ┗ 📜config.json  # Pooling 层配置
 ┣ 📂onnx  # ONNX 推理模型（实际使用的模型文件）
 ┃ ┣ 📜model.onnx  # 标准 ONNX 模型
 ┃ ┣ 📜model_O1.onnx  # 优化版本 O1
 ┃ ┣ 📜model_O2.onnx
 ┃ ┣ 📜model_O3.onnx
 ┃ ┣ 📜model_O4.onnx
 ┃ ┣ 📜model_qint8_arm64.onnx  # ARM 量化模型
 ┃ ┣ 📜model_qint8_avx512.onnx  # AVX512 量化模型
 ┃ ┣ 📜model_qint8_avx512_vnni.onnx
 ┃ ┗ 📜model_quint8_avx2.onnx
 ┣ 📂openvino  # OpenVINO 推理模型
 ┃ ┣ 📜openvino_model.bin  # OpenVINO 权重
 ┃ ┣ 📜openvino_model.xml  # OpenVINO 结构定义
 ┃ ┣ 📜openvino_model_qint8_quantized.bin  # 量化权重
 ┃ ┗ 📜openvino_model_qint8_quantized.xml
 ┣ 📜.gitattributes  # Git 属性设置
 ┣ 📜README.md  # 模型说明文档
 ┣ 📜config.json  # 模型主配置
 ┣ 📜config_sentence_transformers.json  # Sentence-Transformers 配置
 ┣ 📜data_config.json  # 训练/数据相关配置
 ┣ 📜model.safetensors  # safetensors 格式模型权重
 ┣ 📜modules.json  # 模型模块定义
 ┣ 📜pytorch_model.bin  # PyTorch 权重文件
 ┣ 📜rust_model.ot  # Rust 推理模型
 ┣ 📜sentence_bert_config.json  # Sentence-BERT 配置
 ┣ 📜special_tokens_map.json  # 特殊 token 映射
 ┣ 📜tf_model.h5  # TensorFlow 模型
 ┣ 📜tokenizer.json  # tokenizer 定义
 ┣ 📜tokenizer_config.json  # tokenizer 配置
 ┣ 📜train_script.py  # 模型训练脚本（通常不直接使用）
 ┗ 📜vocab.txt  # 词表文件

📦chroma_db  # Chroma 向量数据库（RAG 检索用）  🌟 数据库需要从项目结构里分开
 ┣ 📂aeb43e6d-46ce-4f42-857c-3d25eb4c99e2  # 向量集合（collection）实例
 ┃ ┣ 📜data_level0.bin  # 向量数据（二进制）
 ┃ ┣ 📜header.bin  # 索引头信息
 ┃ ┣ 📜length.bin  # 向量长度信息
 ┃ ┗ 📜link_lists.bin  # HNSW 图结构链接数据
 ┣ 📂cb70bc2f-519b-432c-bfc1-c84d60e0e824  # 另一向量集合实例
 ┃ ┣ 📜data_level0.bin
 ┃ ┣ 📜header.bin
 ┃ ┣ 📜length.bin
 ┃ ┗ 📜link_lists.bin
 ┣ 📜.DS_Store  # macOS 自动生成文件（可忽略）
 ┗ 📜chroma.sqlite3  # ChromaDB 元数据库（集合、元数据、配置）
