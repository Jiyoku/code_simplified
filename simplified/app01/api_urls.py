#coding=utf-8
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

# 创建路由器
router = DefaultRouter()
router.register(r'posts', api_views.PostViewSet, basename='post')
router.register(r'tags', api_views.TagViewSet, basename='tag')
router.register(r'books', api_views.BookViewSet, basename='book')
router.register(r'book-sales', api_views.BookSaleViewSet, basename='book-sale')

urlpatterns = [
    # 认证相关
    path('auth/register/', api_views.register, name='api_register'),
    path('auth/login/', api_views.login, name='api_login'),
    path('auth/logout/', api_views.logout, name='api_logout'),
    path('auth/change-password/', api_views.change_password, name='api_change_password'),
    
    # 用户账户
    path('account/', api_views.account, name='api_account'),
    
    # 首页数据
    path('index/', api_views.index_data, name='api_index'),
    
    # 搜索
    path('search/', api_views.search, name='api_search'),
    
    # ViewSet 路由
    path('', include(router.urls)),

        # ==================== 认证相关 ====================
    path('auth/login/', api_views.login, name='api_login'),
    path('auth/register/', api_views.register, name='api_register'),
    path('auth/logout/', api_views.logout, name='api_logout'),
    path('auth/change-password/', api_views.change_password, name='api_change_password'),
 

    # ==================== RAG智能搜索 ====================⭐
    path('rag/search/', api_views.rag_search, name='api_rag_search'),
    path('rag/stream-search/', api_views.rag_stream_search, name='api_rag_stream_search'),
    path('rag/semantic-search/', api_views.semantic_search, name='api_semantic_search'),
    path('rag/stats/', api_views.rag_stats, name='api_rag_stats'),
]