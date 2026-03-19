from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} account'

class Tag(models.Model):
    name = models.CharField('标签名称', max_length=50, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='创建者')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'
        ordering = ['name']

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField('书名', max_length=200)
    author = models.CharField('作者', max_length=100)
    isbn = models.CharField('ISBN', max_length=20, blank=True)
    description = models.TextField('书籍描述', max_length=1000, blank=True)
    cover_image = models.URLField('封面图片链接', blank=True)
    publisher = models.CharField('出版社', max_length=100, blank=True)
    publish_date = models.DateField('出版日期', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='创建者')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    is_active = models.BooleanField('是否激活', default=True)

    class Meta:
        verbose_name = '书籍'
        verbose_name_plural = '书籍'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.author}"

class BookSale(models.Model):
    CONDITION_CHOICES = [
        ('new', '全新'),
        ('good', '九成新'),
        ('fair', '八成新'),
        ('poor', '七成新以下'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='sales')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='出售者')
    price = models.DecimalField('价格', max_digits=10, decimal_places=2)
    condition = models.CharField('新旧程度', max_length=10, choices=CONDITION_CHOICES)
    contact_info = models.CharField('联系方式', max_length=100)
    notes = models.TextField('备注', max_length=500, blank=True)
    is_available = models.BooleanField('是否可售', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '书籍出售信息'
        verbose_name_plural = '书籍出售信息'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.book.title} - {self.seller.username}"

class Post(models.Model):
    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容', max_length=2000)
    author = models.ForeignKey(User, on_delete=models.CASCADE,
                              null=False, blank=False)
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts', verbose_name='标签')
    recommended_books = models.ManyToManyField(Book, blank=True, related_name='recommended_in_posts', verbose_name='推荐书籍')
    views = models.IntegerField('浏览次数', default=0)
    likes = models.IntegerField('点赞数', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    is_active = models.BooleanField('是否激活', default=True)

    class Meta:
        verbose_name = '帖子'
        verbose_name_plural = '帖子'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


