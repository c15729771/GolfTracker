#from django.contrib import admin


from . import views
from django.urls import path, include
from django.conf.urls import url
from users import views as user_views

urlpatterns = [
    path('', views.index, name='Golf-Journal-index'),
    path('register/', user_views.register, name='register'),
    path('about/', views.about, name='Golf-Journal-about'),
    path('TrackNow/', views.TrackNow, name='Golf-Journal-TrackNow'),
    path('CommunityCourses/', views.CommunityCourses, name='Golf-Journal-CommunityCourses'),
    path('MyCourses/', views.MyCourses, name='Golf-Journal-MyCourses'),
    path('MyCourses/getGameEntries', views.getGameEntries, name='getGameEntries'),
    path('MyCourses/create', views.create, name='create'),
    path('MyCourses/createGameEntry', views.createGameEntry, name='createGameEntry'),
    path('MyCourses/deleteGameEntry', views.deleteGameEntry, name='deleteGameEntry'),
    path('TrackNow/getGameEntryById', views.getGameEntryById, name='getGameEntryById'),
    path('', include('pwa.urls')),
    url(r'^create$', views.create, name='create'),
    url(r'^read$', views.read, name='read'),
    url(r'^getGameEntries', views.getGameEntries, name='getGameEntries'),
    url(r'^edit/(?P<id>\d+)$', views.edit, name='edit'),
    url(r'^edit/update/(?P<id>\d+)$', views.update, name='update'),
    url(r'^delete/(?P<id>\d+)$', views.delete, name='delete'),
]
