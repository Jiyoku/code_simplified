"""
向量数据库模块
使用ChromaDB存储和检索文档向量
"""

import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Optional
import hashlib


class VectorStore:
    """向量数据库管理类"""
    
    def __init__(self, persist_directory='./chroma_db', collection_name='knowledge_base'):
        """
        初始化向量数据库
        
        Args:
            persist_directory: 数据库持久化目录
            collection_name: 集合名称
        """
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.client = None
        self.collection = None
        self._initialize()
    
    def _initialize(self):
        os.makedirs(self.persist_directory, exist_ok=True)

        try:
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
        
        except Exception as e:
        # sqlite schema 不兼容时，删掉旧文件重建
            print(f"ChromaDB 初始化失败，尝试重建: {e}")
            import shutil
            shutil.rmtree(self.persist_directory, ignore_errors=True)
            os.makedirs(self.persist_directory, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )

        try:
            self.collection = self.client.get_collection(name=self.collection_name)
            print(f"加载现有集合: {self.collection_name}")
        except Exception:
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"description": "知识分享平台内容向量库"}
        )
            print(f"创建新集合: {self.collection_name}")

    
    def add_document(self, doc_id: str, text: str, embedding: List[float], 
                    metadata: Optional[Dict] = None):
        """
        添加单个文档
        
        Args:
            doc_id: 文档ID
            text: 文档文本
            embedding: 文档向量
            metadata: 元数据（如标题、作者、标签等）
        """
        if metadata is None:
            metadata = {}
        
        self.collection.add(
            ids=[doc_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[metadata]
        )
    
    def add_documents(self, doc_ids: List[str], texts: List[str], 
                     embeddings: List[List[float]], metadatas: Optional[List[Dict]] = None):
        """
        批量添加文档
        
        Args:
            doc_ids: 文档ID列表
            texts: 文档文本列表
            embeddings: 文档向量列表
            metadatas: 元数据列表
        """
        if metadatas is None:
            metadatas = [{} for _ in doc_ids]
        
        # ChromaDB批量插入限制，分批处理
        batch_size = 100
        for i in range(0, len(doc_ids), batch_size):
            batch_ids = doc_ids[i:i+batch_size]
            batch_texts = texts[i:i+batch_size]
            batch_embeddings = embeddings[i:i+batch_size]
            batch_metadatas = metadatas[i:i+batch_size]
            
            self.collection.add(
                ids=batch_ids,
                documents=batch_texts,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas
            )
        
        print(f"成功添加 {len(doc_ids)} 个文档")
    
    def search(self, query_embedding: List[float], n_results: int = 5, 
              filter_dict: Optional[Dict] = None):
        """
        向量相似度搜索
        
        Args:
            query_embedding: 查询向量
            n_results: 返回结果数量
            filter_dict: 过滤条件（如 {"type": "post"}）
            
        Returns:
            dict: 搜索结果
        """
        where_filter = filter_dict if filter_dict else None
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter,
            include=['documents', 'metadatas', 'distances']
        )
        
        return self._format_results(results)
    
    def _format_results(self, results):
        """格式化搜索结果"""
        if not results['ids'] or not results['ids'][0]:
            return []
        
        formatted = []
        for i in range(len(results['ids'][0])):
            formatted.append({
                'id': results['ids'][0][i],
                'document': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'distance': results['distances'][0][i],
                'score': 1 - results['distances'][0][i]  # 转换为相似度分数
            })
        
        return formatted
    
    def update_document(self, doc_id: str, text: str = None, 
                       embedding: List[float] = None, metadata: Dict = None):
        """
        更新文档
        
        Args:
            doc_id: 文档ID
            text: 新文本（可选）
            embedding: 新向量（可选）
            metadata: 新元数据（可选）
        """
        update_dict = {'ids': [doc_id]}
        
        if text is not None:
            update_dict['documents'] = [text]
        if embedding is not None:
            update_dict['embeddings'] = [embedding]
        if metadata is not None:
            update_dict['metadatas'] = [metadata]
        
        self.collection.update(**update_dict)
    
    def delete_document(self, doc_id: str):
        """删除文档"""
        self.collection.delete(ids=[doc_id])
    
    def delete_documents(self, doc_ids: List[str]):
        """批量删除文档"""
        self.collection.delete(ids=doc_ids)
    
    def get_document(self, doc_id: str):
        """获取单个文档"""
        results = self.collection.get(
            ids=[doc_id],
            include=['documents', 'metadatas', 'embeddings']
        )
        
        if not results['ids']:
            return None
        
        return {
            'id': results['ids'][0],
            'document': results['documents'][0],
            'metadata': results['metadatas'][0],
            'embedding': results['embeddings'][0]
        }
    
    def count(self):
        """获取文档总数"""
        return self.collection.count()
    
    def reset(self):
        """重置集合（删除所有数据）"""
        self.client.delete_collection(name=self.collection_name)
        self._initialize()
        print(f"集合已重置: {self.collection_name}")


# 全局实例
_vector_store = None

def get_vector_store():
    """获取全局向量数据库实例"""
    global _vector_store
    if _vector_store is None:
        persist_dir = os.getenv('CHROMA_PERSIST_DIRECTORY', '/data/app/Knowly/chroma_db')
        try:
            _vector_store = VectorStore(persist_directory=persist_dir)
        except Exception as e:
            print(f"向量数据库初始化失败: {e}")
            raise
    return _vector_store


# 便捷函数
def generate_doc_id(content_type, content_id):
    """
    生成文档ID
    
    Args:
        content_type: 内容类型（post/book）
        content_id: 内容ID
        
    Returns:
        str: 文档ID
    """
    return f"{content_type}_{content_id}"


def parse_doc_id(doc_id):
    """
    解析文档ID
    
    Args:
        doc_id: 文档ID
        
    Returns:
        tuple: (content_type, content_id)
    """
    parts = doc_id.split('_', 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return None, None


if __name__ == '__main__':
    # 测试代码
    import numpy as np
    
    store = VectorStore(persist_directory='./test_chroma_db')
    
    # 测试添加文档
    print("\n测试添加文档...")
    test_docs = [
        {
            'id': 'post_1',
            'text': 'Python是一门流行的编程语言',
            'embedding': np.random.rand(384).tolist(),
            'metadata': {'type': 'post', 'title': 'Python入门'}
        },
        {
            'id': 'post_2',
            'text': 'Django是Python的Web框架',
            'embedding': np.random.rand(384).tolist(),
            'metadata': {'type': 'post', 'title': 'Django教程'}
        },
        {
            'id': 'book_1',
            'text': 'JavaScript权威指南',
            'embedding': np.random.rand(384).tolist(),
            'metadata': {'type': 'book', 'title': 'JavaScript'}
        }
    ]
    
    for doc in test_docs:
        store.add_document(
            doc['id'],
            doc['text'],
            doc['embedding'],
            doc['metadata']
        )
    
    print(f"文档总数: {store.count()}")
    
    # 测试搜索
    print("\n测试搜索...")
    query_emb = np.random.rand(384).tolist()
    results = store.search(query_emb, n_results=2)
    
    print(f"找到 {len(results)} 个结果:")
    for r in results:
        print(f"  - {r['id']}: {r['metadata'].get('title')} (score: {r['score']:.4f})")
    
    # 测试过滤
    print("\n测试过滤搜索...")
    results = store.search(query_emb, n_results=2, filter_dict={'type': 'post'})
    print(f"只搜索帖子，找到 {len(results)} 个结果")
    
    # 清理
    print("\n清理测试数据...")
    store.reset()
