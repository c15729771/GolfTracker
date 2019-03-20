from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='Golf-Journal-index'),
    path('about/', views.about, name='Golf-Journal-about'),
    path('TrackNow/', views.TrackNow, name='Golf-Journal-TrackNow'),
    path('CommunityCourses/', views.CommunityCourses, name='Golf-Journal-CommunityCourses'),
    path('MyCourses/', views.MyCourses, name='Golf-Journal-MyCourses'),
    path('admin/', admin.site.urls),
    path('', include('pwa.urls')),
]
