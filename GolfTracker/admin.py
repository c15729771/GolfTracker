from django.contrib import admin

# Register your models here.
from GolfTracker.models import Post, Member

admin.site.register(Post)
admin.site.register(Member)