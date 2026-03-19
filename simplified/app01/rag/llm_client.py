import os
from typing import List, Dict, Optional
import json
import requests


class BaseLLMClient:
    """LLM客户端基类"""
    
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or self._get_api_key()
        self.model = model or self._get_default_model()
    
    def _get_api_key(self):
        raise NotImplementedError
    
    def _get_default_model(self):
        raise NotImplementedError
    
    def generate(self, prompt: str, **kwargs) -> str:
        raise NotImplementedError
    
    def stream_generate(self, prompt: str, **kwargs):
        raise NotImplementedError

class OpenAIClient(BaseLLMClient):
    """OpenAI客户端"""
    
    def __init__(self, api_key: str = None, model: str = None):
        super().__init__(api_key, model)
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.api_key)
        except ImportError:
            raise ImportError("请安装openai库: pip install openai")
    
    def _get_api_key(self):
        return os.getenv('OPENAI_API_KEY')
    
    def _get_default_model(self):
        return os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    
    def generate(self, prompt: str, temperature: float = 0.7, 
                max_tokens: int = 1000, **kwargs) -> str:
        """
        生成回复
        
        Args:
            prompt: 提示词
            temperature: 温度参数（0-2），越高越随机
            max_tokens: 最大token数
            
        Returns:
            str: LLM生成的文本
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个知识分享平台的智能助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API调用失败: {e}")
            raise
    
    def stream_generate(self, prompt: str, temperature: float = 0.7,
                       max_tokens: int = 1000, **kwargs):
        """
        流式生成回复
        
        Args:
            prompt: 提示词
            temperature: 温度参数
            max_tokens: 最大token数
            
        Yields:
            str: 生成的文本片段
        """
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个知识分享平台的智能助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"OpenAI流式API调用失败: {e}")
            raise

class SEUClient(BaseLLMClient):
    """东南大学 OpenAI 兼容客户端"""
    
    def __init__(self, api_key: str = None, model: str = None):
        import openai
        self.base_url = os.getenv("SEU_BASE_URL", "https://openapi.seu.edu.cn/v1")
        self.api_key = api_key or os.getenv('SEU_API_KEY', '919020a9-0af6-4942-8678-2a4e2aad8a1f')
        self.model = model or os.getenv('SEU_MODEL', 'qwen2.5-72b')
        self.client = openai.OpenAI(
            base_url='https://openapi.seu.edu.cn/v1',
            api_key=self.api_key
        )
        print("[SEUClient] model    =", self.model)
        print("[SEUClient] proxy env=", {
            "HTTP_PROXY": os.getenv("HTTP_PROXY"),
            "HTTPS_PROXY": os.getenv("HTTPS_PROXY"),
            "ALL_PROXY": os.getenv("ALL_PROXY"),
            "NO_PROXY": os.getenv("NO_PROXY"),
        })

    def _get_api_key(self):
        return os.getenv('SEU_API_KEY')

    def _get_default_model(self):
        return os.getenv('SEU_MODEL', 'qwen2.5-72b')

    def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000, **kwargs) -> str:
        try:
            print("[SEUClient] calling /chat/completions with", self.base_url, self.model)
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个知识分享平台的智能助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"SEU API调用失败: {e}")
            raise

    def stream_generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000, **kwargs):
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个知识分享平台的智能助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"SEU流式API调用失败: {e}")
            raise

# LLM工厂函数
def get_llm_client(provider: str = 'openai'):
    """
    获取LLM客户端
    
    Args:
        provider: LLM提供商（openai/anthropic/gemini）
        
    Returns:
        BaseLLMClient: LLM客户端实例
    """
    providers = {
        'openai': OpenAIClient, 
        'seu': SEUClient,     
        'qwen': SEUClient, 
    }
    
    client_class = providers.get(provider.lower())
    if not client_class:
        raise ValueError(f"不支持的LLM提供商: {provider}")
    
    return client_class()


# 全局实例
_llm_client = None

def get_default_llm_client():
    """获取默认LLM客户端"""
    global _llm_client
    if _llm_client is None:
        provider = os.getenv('LLM_PROVIDER', 'openai')
        _llm_client = get_llm_client(provider)
    return _llm_client


if __name__ == '__main__':
    # 测试代码
    print("测试LLM客户端...")
    
    # 测试OpenAI
    try:
        print("\n测试OpenAI...")
        client = OpenAIClient()
        response = client.generate("简单介绍一下Python编程语言", max_tokens=100)
        print(f"响应: {response[:200]}...")
        
        # 测试流式生成
        print("\n测试流式生成...")
        print("响应: ", end='')
        for chunk in client.stream_generate("Python的主要特点是什么？", max_tokens=100):
            print(chunk, end='', flush=True)
        print()
    except Exception as e:
        print(f"OpenAI测试失败: {e}")
    
    # 测试工厂函数
    print("\n测试工厂函数...")
    client = get_default_llm_client()
    print(f"默认客户端类型: {type(client).__name__}")
