#coding=utf-8
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404

from .models import Post, Tag, Book, BookSale, Account
from .serializers import (
    UserSerializer, PostSerializer, TagSerializer, 
    BookSerializer, BookSaleSerializer, AccountSerializer
)

import logging
logger = logging.getLogger(__name__)

from django.http import StreamingHttpResponse
from django.core.cache import cache
from app01.rag.rag_search import get_rag_engine
import json
import time


# ==================== 用户认证相关 API ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """用户注册"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    password2 = request.data.get('password2')
    
    if not all([username, email, password, password2]):
        return Response(
            {'error': '所有字段都是必填的'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if password != password2:
        return Response(
            {'error': '两次密码不一致'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': '用户名已存在'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': '邮箱已被注册'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # 创建 Token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'message': '注册成功',
        'user': UserSerializer(user).data,
        'token': token.key
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """用户登录"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': '请输入用户名和密码'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # 创建或获取 Token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': '登录成功',
            'user': UserSerializer(user).data,
            'token': token.key
        })
    else:
        return Response(
            {'error': '用户名或密码错误'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """用户登出"""
    try:
        # 删除用户的 token
        request.user.auth_token.delete()
        return Response({'message': '登出成功'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def account(request):
    """用户账户信息"""
    user = request.user
    
    if request.method == 'GET':
        # 获取用户信息
        account_obj, created = Account.objects.get_or_create(user=user)
        
        user_posts = Post.objects.filter(
            author=user, 
            is_active=True
        ).order_by('-created_at')[:5]
        
        user_books = Book.objects.filter(
            created_by=user, 
            is_active=True
        ).order_by('-created_at')[:5]
        
        user_sales = BookSale.objects.filter(
            seller=user, 
            is_available=True
        ).select_related('book').order_by('-created_at')[:5]
        
        return Response({
            'user': UserSerializer(user).data,
            'account': AccountSerializer(account_obj).data,
            'recent_posts': PostSerializer(user_posts, many=True).data,
            'recent_books': BookSerializer(user_books, many=True).data,
            'recent_sales': BookSaleSerializer(user_sales, many=True).data
        })
    
    elif request.method == 'PUT':
        # 更新用户信息
        user.email = request.data.get('email', user.email)
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()
        
        account_obj, created = Account.objects.get_or_create(user=user)
        account_obj.bio = request.data.get('bio', account_obj.bio)
        account_obj.save()
        
        return Response({
            'message': '更新成功',
            'user': UserSerializer(user).data,
            'account': AccountSerializer(account_obj).data
        })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """修改密码"""
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not new_password or not confirm_password:
        return Response(
            {'error': '请填写完整'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password != confirm_password:
        return Response(
            {'error': '两次密码不一致'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.set_password(new_password)
    request.user.save()
    
    # 删除旧 token，强制重新登录
    request.user.auth_token.delete()
    
    return Response({'message': '密码修改成功，请重新登录'})


# ==================== 帖子相关 API ====================

class PostViewSet(viewsets.ModelViewSet):
    """帖子视图集"""
    queryset = Post.objects.filter(is_active=True)
    serializer_class = PostSerializer
    
    def get_permissions(self):
        """设置权限"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'like']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        """获取查询集"""
        queryset = Post.objects.filter(is_active=True).select_related(
            'author'
        ).prefetch_related('tags', 'recommended_books')
        
        # 标签过滤
        tag_id = self.request.query_params.get('tag_id')
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        
        # 作者过滤
        author_id = self.request.query_params.get('author_id')
        if author_id:
            queryset = queryset.filter(author__id=author_id)
        
        # 搜索
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    def _index_post(self, post):
        try:
            rag_engine = get_rag_engine()
            tags = ', '.join([tag.name for tag in post.tags.all()])
            rag_engine.index_content(
                content_id=str(post.id),
                content_type='post',
                title=post.title,
                text=post.content,
                metadata={
                    'author': post.author.username,
                    'tags': tags,
                    'views': post.views,
                    'likes': post.likes,
                }
            )
        except Exception as e:
            logger.error(f'索引帖子失败: {e}')

    
    def retrieve(self, request, *args, **kwargs):
        """获取帖子详情，增加浏览次数"""
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """创建帖子"""
        post = serializer.save(author=self.request.user)
        # 同步到向量数据库
        self._index_post(post)
    
    def perform_update(self, serializer):
        """更新帖子"""
        if serializer.instance.author != self.request.user:
            raise PermissionError('您没有权限编辑此帖子')
        post = serializer.save()
        # 更新向量数据库
        self._index_post(post)
    
    def perform_destroy(self, instance):
        """软删除帖子"""
        if instance.author != self.request.user:
            raise PermissionError('您没有权限删除此帖子')
        instance.is_active = False
        instance.save()
        # 从向量数据库删除
        try:
            rag_engine = get_rag_engine()
            rag_engine.delete_content(str(instance.id), 'post')
        except Exception as e:
            logger.error(f'删除向量索引失败: {e}')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """点赞帖子"""
        post = self.get_object()
        post.likes += 1
        post.save(update_fields=['likes'])
        return Response({
            'message': '点赞成功',
            'likes': post.likes
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        """获取当前用户的帖子"""
        posts = Post.objects.filter(
            author=request.user,
            is_active=True
        ).order_by('-created_at')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


# ==================== 标签相关 API ====================

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """标签视图集（只读）"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """获取热门标签"""
        return Tag.objects.annotate(
            post_count=Count('posts', filter=Q(posts__is_active=True))
        ).filter(post_count__gt=0).order_by('-post_count')


# ==================== 书籍相关 API ====================

class BookViewSet(viewsets.ModelViewSet):
    """书籍视图集"""
    queryset = Book.objects.filter(is_active=True)
    serializer_class = BookSerializer
    
    def get_permissions(self):
        """设置权限"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        """获取查询集"""
        queryset = Book.objects.filter(is_active=True).select_related('created_by')
        
        # 搜索
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(author__icontains=search) |
                Q(description__icontains=search)
            )
        
        # 排序
        order = self.request.query_params.get('order', '-created_at')
        if order == 'popular':
            queryset = queryset.annotate(
                recommendation_count=Count(
                    'recommended_in_posts',
                    filter=Q(recommended_in_posts__is_active=True)
                )
            ).order_by('-recommendation_count')
        else:
            queryset = queryset.order_by(order)
        
        return queryset
    
    def _index_book(self, book):
        try:
            rag_engine = get_rag_engine()
            full_text = f"{book.title} {book.author} {book.description or ''}"
            rag_engine.index_content(
                content_id=str(book.id),
                content_type='book',
                title=book.title,
                text=full_text,
                metadata={
                    'author': book.author,
                    'publisher': book.publisher or '',
                }
            )
        except Exception as e:
            logger.error(f'索引书籍失败: {e}')

    def perform_create(self, serializer):
        """创建书籍"""
        book = serializer.save(created_by=self.request.user)
        # 同步到向量数据库
        self._index_book(book)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_books(self, request):
        """获取当前用户创建的书籍"""
        books = Book.objects.filter(
            created_by=request.user,
            is_active=True
        ).order_by('-created_at')
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)


# ==================== 书籍出售相关 API ====================

class BookSaleViewSet(viewsets.ModelViewSet):
    """书籍出售视图集"""
    queryset = BookSale.objects.filter(is_available=True)
    serializer_class = BookSaleSerializer
    
    def get_permissions(self):
        """设置权限"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        """获取查询集"""
        queryset = BookSale.objects.filter(
            is_available=True
        ).select_related('book', 'seller')
        
        # 按书籍过滤
        book_id = self.request.query_params.get('book_id')
        if book_id:
            queryset = queryset.filter(book__id=book_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """创建出售信息"""
        serializer.save(seller=self.request.user)
    
    def perform_destroy(self, instance):
        """软删除出售信息"""
        if instance.seller != self.request.user:
            raise PermissionError('您没有权限删除此出售信息')
        instance.is_available = False
        instance.save()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_sales(self, request):
        """获取当前用户的出售信息"""
        sales = BookSale.objects.filter(
            seller=request.user,
            is_available=True
        ).select_related('book').order_by('-created_at')
        serializer = self.get_serializer(sales, many=True)
        return Response(serializer.data)


# ==================== 首页数据 API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def index_data(request):
    """首页数据"""
    # 获取热门标签
    tags = Tag.objects.annotate(
        post_count=Count('posts', filter=Q(posts__is_active=True))
    ).filter(post_count__gt=0).order_by('-post_count')[:8]
    
    # 获取推荐帖子
    recommended_posts = Post.objects.filter(
        is_active=True
    ).select_related('author').prefetch_related('tags').order_by(
        '-views', '-likes'
    )[:6]
    
    # 获取热门书籍
    popular_books = Book.objects.filter(is_active=True).annotate(
        recommendation_count=Count(
            'recommended_in_posts',
            filter=Q(recommended_in_posts__is_active=True)
        )
    ).order_by('-recommendation_count')[:3]
    
    return Response({
        'tags': TagSerializer(tags, many=True).data,
        'recommended_posts': PostSerializer(recommended_posts, many=True).data,
        'popular_books': BookSerializer(popular_books, many=True).data
    })


# ==================== 搜索 API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """
    搜索API（支持传统搜索和RAG搜索）
    GET /api/search/?q=关键词&use_rag=true
    """
    query = request.GET.get('q', '').strip()
    use_rag = request.GET.get('use_rag', 'false').lower() == 'true'
    
    if not query:
        return Response({
            'query': query,
            'posts': [],
            'books': []
        })
    
    if use_rag:
        # 使用RAG搜索
        try:
            rag_engine = get_rag_engine()
            result = rag_engine.search(query, n_results=10, generate_summary=False)
            
            # 提取帖子和书籍
            posts_data = []
            books_data = []
            
            for item in result['results']:
                if item['metadata']['type'] == 'post':
                    try:
                        post = Post.objects.get(id=int(item['metadata']['content_id']))
                        posts_data.append(PostSerializer(post).data)
                    except:
                        pass
                elif item['metadata']['type'] == 'book':
                    try:
                        book = Book.objects.get(id=int(item['metadata']['content_id']))
                        books_data.append(BookSerializer(book).data)
                    except:
                        pass
            
            return Response({
                'query': query,
                'posts': posts_data,
                'books': books_data,
                'use_rag': True
            })
        except Exception as e:
            # RAG失败，降级到传统搜索
            use_rag = False
    
    # 传统搜索（原有逻辑）
    posts = Post.objects.filter(
        Q(title__icontains=query) | Q(content__icontains=query),
        is_active=True
    ).select_related('author').prefetch_related('tags', 'recommended_books')
    
    books = Book.objects.filter(
        Q(title__icontains=query) | 
        Q(author__icontains=query) | 
        Q(description__icontains=query)
    ).select_related('created_by')
    
    return Response({
        'query': query,
        'posts': PostSerializer(posts, many=True).data,
        'books': BookSerializer(books, many=True).data,
        'use_rag': False
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def rag_search(request):
    """
    RAG智能搜索
    POST /api/rag/search/
    {
        "query": "如何学习Python？",
        "n_results": 5,
        "content_type": "post",  # 可选: post/book/all
        "generate_summary": true
    }
    """
    try:
        query = request.data.get('query', '').strip()
        if not query:
            return Response(
                {'error': '查询不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        n_results = request.data.get('n_results', 5)
        content_type = request.data.get('content_type')
        generate_summary = request.data.get('generate_summary', True)
        
        # 检查缓存
        if hasattr(cache, 'get'):
            cache_key = f'rag:{query}:{content_type}:{n_results}'
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result, status=status.HTTP_200_OK)
        
        # 获取RAG引擎
        rag_engine = get_rag_engine()
        
        # 执行搜索
        result = rag_engine.search(
            query=query,
            n_results=n_results,
            content_type=content_type,
            generate_summary=generate_summary
        )
        
        # 缓存结果
        if hasattr(cache, 'set'):
            cache.set(cache_key, result, timeout=3600)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def rag_stream_search(request):
    """
    RAG流式搜索（SSE）
    POST /api/rag/stream-search/
    """
    query = request.data.get('query', '').strip()
    if not query:
        return Response(
            {'error': '查询不能为空'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    n_results = request.data.get('n_results', 5)
    content_type = request.data.get('content_type')
    
    def event_stream():
        """SSE事件流生成器"""
        try:
            rag_engine = get_rag_engine()
            
            for event in rag_engine.stream_search(query, n_results, content_type):
                # SSE格式：data: {json}\n\n
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        
        except Exception as e:
            error_event = {
                'type': 'error',
                'data': {'error': str(e)}
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def semantic_search(request):
    """
    纯语义搜索（不生成LLM摘要）
    POST /api/rag/semantic-search/
    """
    try:
        query = request.data.get('query', '').strip()
        if not query:
            return Response(
                {'error': '查询不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        n_results = request.data.get('n_results', 10)
        min_score = request.data.get('min_score', 0.5)
        
        rag_engine = get_rag_engine()
        results = rag_engine.semantic_search(query, n_results, min_score)
        
        return Response({
            'query': query,
            'results': results,
            'count': len(results)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def rag_stats(request):
    """
    获取RAG系统统计信息
    GET /api/rag/stats/
    """
    try:
        rag_engine = get_rag_engine()
        stats = rag_engine.get_stats()
        
        return Response(stats, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
