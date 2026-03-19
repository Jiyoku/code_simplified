from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Post, Tag, Book, BookSale

class UserForm(UserCreationForm):
    email = forms.EmailField(label='邮箱')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': '请输入用户名'})
        self.fields['email'].widget.attrs.update({'class': 'form-control', 'placeholder': '请输入邮箱'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control', 'placeholder': '请输入密码'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control', 'placeholder': '请确认密码'})
        self.fields['username'].label = '用户名'
        self.fields['password1'].label = '密码'
        self.fields['password2'].label = '确认密码'

class PostForm(forms.ModelForm):
    tags = forms.CharField(
        label='标签',
        max_length=200,
        required=False,
        help_text='多个标签用逗号分隔，例如：技术分享,编程教程',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '输入标签，用逗号分隔'
        })
    )
    
    recommended_books = forms.CharField(
        label='推荐书籍',
        max_length=500,
        required=False,
        help_text='输入书名和作者，格式：《书名》-作者，多本书用逗号分隔',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '例如：《Python编程》-作者名，《算法导论》-作者名'
        })
    )

    class Meta:
        model = Post
        fields = ['title', 'content', 'tags', 'recommended_books']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入帖子标题'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 8,
                'placeholder': '分享你的知识和见解...'
            })
        }

    def save(self, commit=True, user=None):
        post = super().save(commit=False)
        if commit:
            post.save()
            # 处理标签
            tags_str = self.cleaned_data.get('tags', '')
            if tags_str:
                tag_names = [name.strip() for name in tags_str.split(',') if name.strip()]
                for tag_name in tag_names:
                    post.author = user
                    tag, created = Tag.objects.get_or_create(
                        name=tag_name,
                        defaults={'created_by': post.author}
                    )
                    post.tags.add(tag)
            
            # 处理推荐书籍
            books_str = self.cleaned_data.get('recommended_books', '')
            if books_str:
                book_entries = [entry.strip() for entry in books_str.split(',') if entry.strip()]
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

    def save_tags(self, post):
        """处理标签的创建和关联"""
        tags_str = self.cleaned_data.get('tags', '')
        if tags_str:
            post.tags.clear()
            tag_names = [name.strip() for name in tags_str.split(',') if name.strip()]
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'created_by': post.author}
                )
                post.tags.add(tag)

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'description', 'cover_image', 'publisher', 'publish_date']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入书名'
            }),
            'author': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入作者'
            }),
            'isbn': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入ISBN（可选）'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': '请输入书籍描述'
            }),
            'cover_image': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入封面图片链接（可选）'
            }),
            'publisher': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入出版社（可选）'
            }),
            'publish_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            })
        }

class BookSaleForm(forms.ModelForm):
    class Meta:
        model = BookSale
        fields = ['price', 'condition', 'contact_info', 'notes']
        widgets = {
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入价格',
                'step': '0.01'
            }),
            'condition': forms.Select(attrs={
                'class': 'form-control'
            }),
            'contact_info': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入联系方式（QQ/微信/邮箱等）'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': '其他说明（可选）'
            })
        }

class TagForm(forms.ModelForm):
    class Meta:
        model = Tag
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入标签名称'
            })
        }
        