"""
提示词模板模块
定义各种RAG任务的提示词模板
"""

from typing import List, Dict


class PromptTemplate:
    """提示词模板基类"""
    
    def format(self, **kwargs) -> str:
        raise NotImplementedError


class RAGSearchPrompt(PromptTemplate):
    """RAG搜索提示词模板"""
    
    def __init__(self):
        self.template = """你是一个知识分享平台的智能搜索助手。你的任务是基于检索到的相关内容，为用户提供准确、有价值的回答。

用户问题：
{query}

检索到的相关内容：
{context}

请基于以上内容回答用户问题，要求：
1. 回答要准确、简洁、专业
2. 优先引用平台上的真实内容
3. 如果内容中有相关的帖子或书籍，请明确推荐
4. 如果检索内容不足以回答问题，请诚实说明
5. 用中文回答

回答格式：
【直接回答】
（这里给出简洁的回答）

【相关内容】
（列出相关的帖子和书籍，格式如下）
- 帖子：《标题》 - 简短说明
- 书籍：《书名》作者 - 简短说明

【补充建议】
（如果有额外建议，可以在这里补充）
"""
    
    def format(self, query: str, context: List[Dict]) -> str:
        # 格式化上下文
        context_text = self._format_context(context)
        
        return self.template.format(
            query=query,
            context=context_text
        )
    
    def _format_context(self, context: List[Dict]) -> str:
        """格式化上下文"""
        if not context:
            return "（没有找到相关内容）"
        
        formatted = []
        for i, doc in enumerate(context, 1):
            metadata = doc.get('metadata', {})
            content = doc.get('document', '')
            content_type = metadata.get('type', 'unknown')
            
            if content_type == 'post':
                title = metadata.get('title', '无标题')
                author = metadata.get('author', '未知作者')
                formatted.append(
                    f"{i}. 【帖子】《{title}》（作者：{author}）\n"
                    f"   内容摘要：{content[:200]}..."
                )
            elif content_type == 'book':
                title = metadata.get('title', '无标题')
                author = metadata.get('author', '未知作者')
                formatted.append(
                    f"{i}. 【书籍】《{title}》（作者：{author}）\n"
                    f"   简介：{content[:200]}..."
                )
        
        return '\n\n'.join(formatted)


class QuestionAnswerPrompt(PromptTemplate):
    """问答提示词模板（更简洁）"""
    
    def __init__(self):
        self.template = """基于以下内容回答用户问题：

问题：{query}

相关内容：
{context}

要求：
- 准确、简洁
- 引用具体内容
- 用中文回答
"""
    
    def format(self, query: str, context: str) -> str:
        return self.template.format(query=query, context=context)


class SummaryPrompt(PromptTemplate):
    """内容摘要提示词模板"""
    
    def __init__(self):
        self.template = """请为以下内容生成一个简洁的摘要（不超过150字）：

{content}

摘要：
"""
    
    def format(self, content: str) -> str:
        return self.template.format(content=content)


class RecommendationPrompt(PromptTemplate):
    """内容推荐提示词模板"""
    
    def __init__(self):
        self.template = """基于用户兴趣和以下内容，推荐相关的学习资源：

用户兴趣：{interest}

可推荐的内容：
{available_content}

请推荐3-5个最相关的资源，并说明推荐理由。
"""
    
    def format(self, interest: str, available_content: List[Dict]) -> str:
        content_text = '\n'.join([
            f"- {c.get('title', '未知')}: {c.get('description', '')[:100]}"
            for c in available_content
        ])
        return self.template.format(
            interest=interest,
            available_content=content_text
        )


class LearningPathPrompt(PromptTemplate):
    """学习路径提示词模板"""
    
    def __init__(self):
        self.template = """基于平台上的内容，为用户规划学习路径：

学习目标：{goal}

平台上的相关内容：
{content}

请规划一个循序渐进的学习路径，包括：
1. 学习阶段划分
2. 每个阶段的学习目标
3. 推荐的帖子和书籍
4. 预估学习时间

格式：
【阶段一：基础入门】
目标：...
推荐内容：...
预估时间：...

【阶段二：...】
...
"""
    
    def format(self, goal: str, content: List[Dict]) -> str:
        content_text = '\n'.join([
            f"- {c.get('metadata', {}).get('title', '未知')}: "
            f"{c.get('document', '')[:100]}..."
            for c in content
        ])
        return self.template.format(goal=goal, content=content_text)


class ComparisonPrompt(PromptTemplate):
    """内容比较提示词模板"""
    
    def __init__(self):
        self.template = """用户想要比较以下内容：

{items}

请从以下方面进行比较：
1. 主要特点
2. 适用场景
3. 优缺点
4. 学习难度
5. 推荐建议

比较分析：
"""
    
    def format(self, items: List[str]) -> str:
        items_text = '\n'.join([f"{i+1}. {item}" for i, item in enumerate(items)])
        return self.template.format(items=items_text)


# 便捷函数
def create_rag_prompt(query: str, context: List[Dict]) -> str:
    """创建RAG搜索提示词"""
    prompt = RAGSearchPrompt()
    return prompt.format(query=query, context=context)


def create_qa_prompt(query: str, context: str) -> str:
    """创建问答提示词"""
    prompt = QuestionAnswerPrompt()
    return prompt.format(query=query, context=context)


def create_summary_prompt(content: str) -> str:
    """创建摘要提示词"""
    prompt = SummaryPrompt()
    return prompt.format(content=content)


def create_recommendation_prompt(interest: str, available_content: List[Dict]) -> str:
    """创建推荐提示词"""
    prompt = RecommendationPrompt()
    return prompt.format(interest=interest, available_content=available_content)


def create_learning_path_prompt(goal: str, content: List[Dict]) -> str:
    """创建学习路径提示词"""
    prompt = LearningPathPrompt()
    return prompt.format(goal=goal, content=content)


if __name__ == '__main__':
    # 测试提示词模板
    
    # 测试RAG搜索提示词
    print("=" * 50)
    print("测试RAG搜索提示词")
    print("=" * 50)
    
    query = "如何学习Python编程？"
    context = [
        {
            'document': 'Python是一门简单易学的编程语言，适合初学者...',
            'metadata': {
                'type': 'post',
                'title': 'Python入门指南',
                'author': '张三'
            }
        },
        {
            'document': '这本书详细介绍了Python的各种特性和应用场景...',
            'metadata': {
                'type': 'book',
                'title': 'Python编程：从入门到实践',
                'author': 'Eric Matthes'
            }
        }
    ]
    
    prompt = create_rag_prompt(query, context)
    print(prompt)
    
    # 测试问答提示词
    print("\n" + "=" * 50)
    print("测试问答提示词")
    print("=" * 50)
    
    prompt = create_qa_prompt(query, "Python是一门简单易学的编程语言...")
    print(prompt)
    
    # 测试摘要提示词
    print("\n" + "=" * 50)
    print("测试摘要提示词")
    print("=" * 50)
    
    content = "Python是一门广泛使用的解释型、高级编程、通用型编程语言..." * 10
    prompt = create_summary_prompt(content)
    print(prompt[:200] + "...")
