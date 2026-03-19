#coding=utf-8
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Tag, Book, BookSale, Account

class FlexibleTagField(serializers.Field):
    """同时接受字符串和数组"""
    def to_internal_value(self, data):
        if isinstance(data, list):
            return ','.join([str(i).strip() for i in data])
        return str(data)
    
    def to_representation(self, value):
        return value
    
class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
# 定义Meta内部类，用于配置序列化器的元数据
    class Meta:
    # 指定该序列化器应用于User模型
        model = User
    # 指定序列化器包含的字段列表，即这些字段将被包含在序列化输出中
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
    # 指定为只读字段的列表，这些字段只能被读取，不能被修改
        read_only_fields = ['id', 'date_joined']


class AccountSerializer(serializers.ModelSerializer):
    """账户序列化器"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Account
        fields = ['id', 'username', 'bio', 'avatar']
        read_only_fields = ['id']


class TagSerializer(serializers.ModelSerializer):
    """标签序列化器"""
    post_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at', 'post_count']
        read_only_fields = ['id', 'created_at']


class BookSerializer(serializers.ModelSerializer):
    """书籍序列化器"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    recommendation_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'description',
            'cover_image', 'publisher', 'publish_date',
            'created_by', 'created_by_username', 'created_at',
            'recommendation_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class BookSaleSerializer(serializers.ModelSerializer):
    """书籍出售序列化器"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    book_details = BookSerializer(source='book', read_only=True)
    
    class Meta:
        model = BookSale
        fields = [
            'id', 'book', 'book_title', 'book_author', 'book_details',
            'seller', 'seller_username', 'price', 'condition',
            'contact_info', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """帖子序列化器"""
    author_username = serializers.CharField(source='author.username', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    recommended_books = BookSerializer(many=True, read_only=True)
    
    # 用于创建/更新时的字段
    tag_names = FlexibleTagField(write_only=True, required=False, default='')
    book_entries = FlexibleTagField(write_only=True, required=False, default='')
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'author_username',
            'tags', 'recommended_books', 'views', 'likes',
            'created_at', 'updated_at',
            'tag_names', 'book_entries'
        ]
        read_only_fields = ['id', 'author', 'views', 'likes', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """创建帖子"""
        tag_names_str = validated_data.pop('tag_names', '')
        book_entries_str = validated_data.pop('book_entries', '')
        if isinstance(tag_names_str, list):
            tag_names_str = ','.join(tag_names_str)
        if isinstance(book_entries_str, list):
            book_entries_str = ','.join(book_entries_str)
        
        post = Post.objects.create(**validated_data)
        
        # 处理标签
        if tag_names_str:
            tag_names = [name.strip() for name in tag_names_str.split(',') if name.strip()]
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'created_by': post.author}
                )
                post.tags.add(tag)
        
        # 处理推荐书籍
        if book_entries_str:
            book_entries = [entry.strip() for entry in book_entries_str.split(',') if entry.strip()]
            for book_entry in book_entries:
                if '》-' in book_entry:
                    try:
                        title_part, author = book_entry.split('》-', 1)
                        title = title_part.replace('《', '').strip()
                        author = author.strip()
                        
                        book, created = Book.objects.get_or_create(
                            title=title,
                            author=author,
                            defaults={'created_by': post.author}
                        )
                        post.recommended_books.add(book)
                    except ValueError:
                        continue
        
        return post
    
    def update(self, instance, validated_data):
        """更新帖子"""
        tag_names_str = validated_data.pop('tag_names', None)
        book_entries_str = validated_data.pop('book_entries', None)
        if isinstance(tag_names_str, list):
            tag_names_str = ','.join(tag_names_str)
        if isinstance(book_entries_str, list):
            book_entries_str = ','.join(book_entries_str)
        
        # 更新基本字段
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()
        
        # 更新标签
        if tag_names_str is not None:
            instance.tags.clear()
            tag_names = [name.strip() for name in tag_names_str.split(',') if name.strip()]
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'created_by': instance.author}
                )
                instance.tags.add(tag)
        
        # 更新推荐书籍
        if book_entries_str is not None:
            instance.recommended_books.clear()
            book_entries = [entry.strip() for entry in book_entries_str.split(',') if entry.strip()]
            for book_entry in book_entries:
                if '》-' in book_entry:
                    try:
                        title_part, author = book_entry.split('》-', 1)
                        title = title_part.replace('《', '').strip()
                        author = author.strip()
                        
                        book, created = Book.objects.get_or_create(
                            title=title,
                            author=author,
                            defaults={'created_by': instance.author}
                        )
                        instance.recommended_books.add(book)
                    except ValueError:
                        continue
        
        return instance