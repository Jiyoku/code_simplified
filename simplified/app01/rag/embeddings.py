"""
文本向量化模块
使用Sentence Transformers生成文本向量
"""

from sentence_transformers import SentenceTransformer
import numpy as np
import os


class EmbeddingGenerator:
    """文本向量生成器"""
    
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        初始化向量生成器
        
        Args:
            model_name: 预训练模型名称
                - all-MiniLM-L6-v2: 轻量级，英文为主（384维）
                - paraphrase-multilingual-MiniLM-L12-v2: 多语言支持（384维）
                - all-mpnet-base-v2: 更高质量（768维）
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """加载预训练模型"""
        try:
            # 检查是否是本地路径
            if os.path.exists(self.model_name):
                print(f"正在加载本地模型: {self.model_name}")
                # 使用本地路径加载
                self.model = SentenceTransformer(self.model_name)
            else:
                print(f"正在下载并加载模型: {self.model_name}")
                self.model = SentenceTransformer(self.model_name)
            
            print(f"模型加载成功，向量维度: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            print(f"模型加载失败: {e}")
            raise
    
    def encode(self, texts, show_progress=False):
        """
        将文本转换为向量
        
        Args:
            texts: 单个文本字符串或文本列表
            show_progress: 是否显示进度条
            
        Returns:
            numpy.ndarray: 文本向量
        """
        if isinstance(texts, str):
            texts = [texts]
        
        try:
            embeddings = self.model.encode(
                texts,
                show_progress_bar=show_progress,
                convert_to_numpy=True,
                normalize_embeddings=True  # 归一化，便于计算余弦相似度
            )
            return embeddings
        except Exception as e:
            print(f"向量化失败: {e}")
            raise
    
    def encode_single(self, text):
        """
        将单个文本转换为向量
        
        Args:
            text: 文本字符串
            
        Returns:
            numpy.ndarray: 文本向量（1维数组）
        """
        embedding = self.encode([text])[0]
        return embedding
    
    def similarity(self, text1, text2):
        """
        计算两个文本的相似度（余弦相似度）
        
        Args:
            text1: 第一个文本
            text2: 第二个文本
            
        Returns:
            float: 相似度分数（0-1之间）
        """
        emb1 = self.encode_single(text1)
        emb2 = self.encode_single(text2)
        
        # 余弦相似度
        similarity = np.dot(emb1, emb2)
        return float(similarity)
    
    def batch_similarity(self, query, documents):
        """
        计算查询文本与多个文档的相似度
        
        Args:
            query: 查询文本
            documents: 文档列表
            
        Returns:
            list: 相似度分数列表
        """
        query_emb = self.encode_single(query)
        doc_embs = self.encode(documents)
        
        # 计算所有文档的相似度
        similarities = np.dot(doc_embs, query_emb)
        return similarities.tolist()
    
    @property
    def embedding_dimension(self):
        """获取向量维度"""
        return self.model.get_sentence_embedding_dimension()


# 全局实例（单例模式）
_embedding_generator = None

def get_embedding_generator():
    """获取全局向量生成器实例"""
    global _embedding_generator
    if _embedding_generator is None:
        # 首先尝试使用本地模型
        local_model_path = os.path.abspath("local_models/all-MiniLM-L6-v2")
        if os.path.exists(local_model_path):
            print(f"使用本地模型: {local_model_path}")
            _embedding_generator = EmbeddingGenerator(local_model_path)
        else:
            # 如果本地模型不存在，使用环境变量指定的模型或默认模型
            model_name = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
            print(f"本地模型不存在，使用: {model_name}")
            _embedding_generator = EmbeddingGenerator(model_name)
    return _embedding_generator


def embed_text(text):
    """
    便捷函数：生成单个文本的向量
    
    Args:
        text: 文本字符串
        
    Returns:
        numpy.ndarray: 文本向量
    """
    generator = get_embedding_generator()
    return generator.encode_single(text)


def embed_texts(texts):
    """
    便捷函数：批量生成文本向量
    
    Args:
        texts: 文本列表
        
    Returns:
        numpy.ndarray: 文本向量数组
    """
    generator = get_embedding_generator()
    return generator.encode(texts)


if __name__ == '__main__':
    # 测试代码 - 使用本地模型
    local_model_path = os.path.abspath("local_models/all-MiniLM-L6-v2")
    if os.path.exists(local_model_path):
        print(f"测试本地模型: {local_model_path}")
        generator = EmbeddingGenerator(local_model_path)
    else:
        print("本地模型不存在，使用默认模型")
        generator = EmbeddingGenerator()
    
    # 测试单个文本
    text = "这是一个测试文本"
    embedding = generator.encode_single(text)
    print(f"向量维度: {embedding.shape}")
    print(f"向量前5个值: {embedding[:5]}")
    
    # 测试相似度
    text1 = "Python是一门编程语言"
    text2 = "Python用于编程开发"
    text3 = "我喜欢吃苹果"
    
    sim1 = generator.similarity(text1, text2)
    sim2 = generator.similarity(text1, text3)
    
    print(f"\n'{text1}' 和 '{text2}' 的相似度: {sim1:.4f}")
    print(f"'{text1}' 和 '{text3}' 的相似度: {sim2:.4f}")
    
    # 测试批量相似度
    query = "Python编程"
    docs = ["Python教程", "Java开发", "前端设计", "Python入门"]
    similarities = generator.batch_similarity(query, docs)
    
    print(f"\n查询: '{query}'")
    for doc, sim in zip(docs, similarities):
        print(f"  {doc}: {sim:.4f}")