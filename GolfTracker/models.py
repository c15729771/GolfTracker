from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Post(models.Model):
    title = models.CharField(max_length=300)
    mapcontent = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

class Member(models.Model):
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)

    def __str__(self):
        return self.firstname + " " + self.lastname
