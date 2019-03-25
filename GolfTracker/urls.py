from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from . import views

urlpatterns = [
    path('', views.index, name='Golf-Journal-index'),
    path('about/', views.about, name='Golf-Journal-about'),
    path('TrackNow/', views.TrackNow, name='Golf-Journal-TrackNow'),
    path('CommunityCourses/', views.CommunityCourses, name='Golf-Journal-CommunityCourses'),
    path('MyCourses/', views.MyCourses, name='Golf-Journal-MyCourses'),
    path('admin/', admin.site.urls),
    path('', include('pwa.urls')),
    url(r'^create$', views.create, name='create'),
    url(r'^read$', views.read, name='read'),
    url(r'^edit/(?P<id>\d+)$', views.edit, name='edit'),
    url(r'^edit/update/(?P<id>\d+)$', views.update, name='update'),
    url(r'^delete/(?P<id>\d+)$', views.delete, name='delete'),
]
