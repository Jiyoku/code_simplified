"""
RAG搜索引擎核心模块
整合向量搜索和LLM生成
"""

from typing import List, Dict, Optional, Iterator
from app01.rag.embeddings import get_embedding_generator, embed_text
from app01.rag.vector_store import get_vector_store
from app01.rag.llm_client import get_default_llm_client
from app01.rag.prompts import create_rag_prompt, create_qa_prompt
import time


class RAGSearchEngine:
    """RAG搜索引擎"""
    
    def __init__(self):
        """初始化RAG搜索引擎"""
        self.embedding_generator = get_embedding_generator()
        self.vector_store = get_vector_store()
        self.llm_client = get_default_llm_client()
    
    def search(self, query: str, n_results: int = 5, 
              content_type: Optional[str] = None,
              generate_summary: bool = True) -> Dict:
        """
        RAG搜索
        
        Args:
            query: 用户查询
            n_results: 返回结果数量
            content_type: 内容类型过滤（post/book）
            generate_summary: 是否生成LLM摘要
            
        Returns:
            dict: 搜索结果
                - query: 查询文本
                - results: 检索结果列表
                - summary: LLM生成的摘要（如果generate_summary=True）
                - search_time: 搜索耗时
                - generation_time: 生成耗时
        """
        start_time = time.time()
        
        # 1. 生成查询向量
        query_embedding = embed_text(query)
        
        # 2. 向量搜索
        filter_dict = {'type': content_type} if content_type else None
        search_results = self.vector_store.search(
            query_embedding.tolist(),
            n_results=n_results,
            filter_dict=filter_dict
        )
        
        search_time = time.time() - start_time
        
        # 3. 生成LLM摘要（可选）
        summary = None
        generation_time = 0
        
        if generate_summary and search_results:
            gen_start = time.time()
            try:
                prompt = create_rag_prompt(query, search_results)
                summary = self.llm_client.generate(prompt, temperature=0.7, max_tokens=800)
            except Exception as e:
                print(f"LLM生成失败: {e}")
                summary = "抱歉，生成摘要时出现错误。"
            generation_time = time.time() - gen_start
        
        return {
            'query': query,
            'results': search_results,
            'summary': summary,
            'search_time': round(search_time, 3),
            'generation_time': round(generation_time, 3),
            'total_time': round(search_time + generation_time, 3)
        }
    
    def stream_search(self, query: str, n_results: int = 5,
                     content_type: Optional[str] = None) -> Iterator[Dict]:
        """
        流式RAG搜索
        
        Args:
            query: 用户查询
            n_results: 返回结果数量
            content_type: 内容类型过滤
            
        Yields:
            dict: 流式响应
                - type: 'search' | 'stream' | 'done'
                - data: 数据内容
        """
        # 1. 返回搜索结果
        query_embedding = embed_text(query)
        filter_dict = {'type': content_type} if content_type else None
        search_results = self.vector_store.search(
            query_embedding.tolist(),
            n_results=n_results,
            filter_dict=filter_dict
        )
        
        yield {
            'type': 'search',
            'data': {
                'results': search_results,
                'count': len(search_results)
            }
        }
        
        # 2. 流式生成LLM回复
        if search_results:
            prompt = create_rag_prompt(query, search_results)
            
            try:
                for chunk in self.llm_client.stream_generate(prompt, temperature=0.7, max_tokens=800):
                    yield {
                        'type': 'stream',
                        'data': {'text': chunk}
                    }
            except Exception as e:
                yield {
                    'type': 'error',
                    'data': {'error': str(e)}
                }
        
        # 3. 完成信号
        yield {
            'type': 'done',
            'data': {}
        }
    
    def semantic_search(self, query: str, n_results: int = 10,
                       min_score: float = 0.5) -> List[Dict]:
        """
        纯语义搜索（不生成LLM摘要）
        
        Args:
            query: 查询文本
            n_results: 返回结果数量
            min_score: 最小相似度分数
            
        Returns:
            list: 搜索结果列表
        """
        query_embedding = embed_text(query)
        results = self.vector_store.search(
            query_embedding.tolist(),
            n_results=n_results
        )
        
        # 过滤低分结果
        filtered_results = [r for r in results if r['score'] >= min_score]
        
        return filtered_results
    
    def question_answer(self, question: str, context: str = None) -> str:
        """
        问答（基于提供的上下文或自动检索）
        
        Args:
            question: 问题
            context: 上下文（可选，如不提供则自动检索）
            
        Returns:
            str: LLM生成的回答
        """
        if context is None:
            # 自动检索相关内容
            search_results = self.semantic_search(question, n_results=3)
            context = '\n\n'.join([
                f"{r['metadata'].get('title', '')}: {r['document'][:200]}..."
                for r in search_results
            ])
        
        prompt = create_qa_prompt(question, context)
        answer = self.llm_client.generate(prompt, temperature=0.5, max_tokens=500)
        
        return answer
    
    def index_content(self, content_id: str, content_type: str, 
                     title: str, text: str, metadata: Dict = None):
        """
        索引单个内容
        
        Args:
            content_id: 内容ID
            content_type: 内容类型（post/book）
            title: 标题
            text: 文本内容
            metadata: 额外元数据
        """
        # 生成文档ID
        doc_id = f"{content_type}_{content_id}"
        
        # 组合文本（标题+内容）
        full_text = f"{title}\n{text}"
        
        # 生成向量
        embedding = embed_text(full_text)
        
        # 准备元数据
        meta = metadata or {}
        meta.update({
            'type': content_type,
            'title': title,
            'content_id': content_id
        })
        
        try:
            existing = self.vector_store.get_document(doc_id)
            if existing:
                self.vector_store.update_document(
                    doc_id=doc_id,
                    text=full_text,
                    embedding=embedding.tolist(),
                    metadata=meta
                )
            else:
                self.vector_store.add_document(
                    doc_id=doc_id,
                    text=full_text,
                    embedding=embedding.tolist(),
                    metadata=meta
                )
        except Exception:
            self.vector_store.add_document(
                doc_id=doc_id,
                text=full_text,
                embedding=embedding.tolist(),
                metadata=meta
            )

    
    def batch_index(self, items: List[Dict], show_progress: bool = True):
        """
        批量索引
        
        Args:
            items: 内容列表，每项包含：
                - content_id
                - content_type
                - title
                - text
                - metadata (可选)
            show_progress: 是否显示进度
        """
        doc_ids = []
        texts = []
        metadatas = []
        
        for item in items:
            content_id = item['content_id']
            content_type = item['content_type']
            title = item['title']
            text = item['text']
            metadata = item.get('metadata', {})
            
            # 文档ID
            doc_id = f"{content_type}_{content_id}"
            doc_ids.append(doc_id)
            
            # 组合文本
            full_text = f"{title}\n{text}"
            texts.append(full_text)
            
            # 元数据
            meta = metadata.copy()
            meta.update({
                'type': content_type,
                'title': title,
                'content_id': content_id
            })
            metadatas.append(meta)
        
        # 批量生成向量
        print(f"正在生成 {len(texts)} 个文档的向量...")
        embeddings = self.embedding_generator.encode(texts, show_progress=show_progress)
        
        # 批量存储
        print(f"正在存储到向量数据库...")
        self.vector_store.add_documents(
            doc_ids=doc_ids,
            texts=texts,
            embeddings=embeddings.tolist(),
            metadatas=metadatas
        )
        
        print(f"批量索引完成，共 {len(items)} 个文档")
    
    def delete_content(self, content_id: str, content_type: str):
        """删除索引内容"""
        doc_id = f"{content_type}_{content_id}"
        self.vector_store.delete_document(doc_id)
    
    def update_content(self, content_id: str, content_type: str,
                      title: str = None, text: str = None, metadata: Dict = None):
        """更新索引内容"""
        doc_id = f"{content_type}_{content_id}"
        
        # 如果标题或文本更新，重新生成向量
        if title or text:
            # 获取现有文档
            existing = self.vector_store.get_document(doc_id)
            if existing:
                old_text = existing['document']
                # 更新文本
                new_text = f"{title or ''}\n{text or ''}" if (title and text) else old_text
                # 重新生成向量
                embedding = embed_text(new_text)
                
                self.vector_store.update_document(
                    doc_id=doc_id,
                    text=new_text,
                    embedding=embedding.tolist(),
                    metadata=metadata
                )
        elif metadata:
            # 只更新元数据
            self.vector_store.update_document(
                doc_id=doc_id,
                metadata=metadata
            )
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        total_docs = self.vector_store.count()
        
        return {
            'total_documents': total_docs,
            'embedding_dimension': self.embedding_generator.embedding_dimension,
            'llm_model': self.llm_client.model
        }


# 全局实例
_rag_engine = None

def get_rag_engine():
    """获取全局RAG搜索引擎实例"""
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGSearchEngine()
    return _rag_engine


if __name__ == '__main__':
    # 测试代码
    print("初始化RAG搜索引擎...")
    engine = RAGSearchEngine()
    
    # 测试索引
    print("\n测试索引内容...")
    test_items = [
        {
            'content_id': '1',
            'content_type': 'post',
            'title': 'Python编程入门',
            'text': 'Python是一门简单易学的编程语言，适合初学者。本文介绍Python的基础语法...',
            'metadata': {'author': '张三', 'tags': ['Python', '编程']}
        },
        {
            'content_id': '2',
            'content_type': 'post',
            'title': 'Django Web开发',
            'text': 'Django是Python的Web框架，用于快速开发Web应用。本文介绍Django的基础...',
            'metadata': {'author': '李四', 'tags': ['Django', 'Web']}
        }
    ]
    
    engine.batch_index(test_items)
    
    # 测试搜索
    print("\n测试RAG搜索...")
    result = engine.search("如何学习Python？", n_results=2, generate_summary=False)
    
    print(f"查询: {result['query']}")
    print(f"搜索耗时: {result['search_time']}秒")
    print(f"找到 {len(result['results'])} 个结果:")
    for r in result['results']:
        print(f"  - {r['metadata']['title']} (相似度: {r['score']:.4f})")
    
    # 获取统计
    print("\n统计信息:")
    stats = engine.get_stats()
    print(f"  文档总数: {stats['total_documents']}")
    print(f"  向量维度: {stats['embedding_dimension']}")
