from django.contrib import admin

# Register your models here.
from GolfTracker.models import Post, Member, Hole, Game

admin.site.register(Post)
admin.site.register(Member)
admin.site.register(Hole)
admin.site.register(Game)
