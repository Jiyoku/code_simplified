"""
URL configuration for DjangoProject project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API 路由（前后端分离）
    path('api/', include('app01.api_urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# 开发环境下提供静态文件服务
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)