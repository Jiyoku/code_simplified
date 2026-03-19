from django.apps import AppConfig

class App01Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app01'

    def ready(self):
        # 导入模板标签
        import app01.templatetags.cart_filters 