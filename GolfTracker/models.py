from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.conf import settings


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

class Game(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    courseName = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    notes = models.CharField(max_length=1000)
    datePlayed = models.DateField()

class Hole(models.Model):
    HOLE_NUMBERS = (
        ('1', 'Hole 1'),
        ('2', 'Hole 2'),
        ('3', 'Hole 3'),
        ('4', 'Hole 4'),
        ('5', 'Hole 5'),
        ('6', 'Hole 6'),
        ('7', 'Hole 7'),
        ('8', 'Hole 8'),
        ('9', 'Hole 9'),
        ('10', 'Hole 10'),
        ('11', 'Hole 11'),
        ('12', 'Hole 12'),
        ('13', 'Hole 13'),
        ('14', 'Hole 14'),
        ('15', 'Hole 15'),
        ('16', 'Hole 16'),
        ('17', 'Hole 17'),
        ('18', 'Hole 18'),
    )
    game = models.ForeignKey('Game', on_delete=models.CASCADE)
    hole_number = models.CharField(max_length=2, choices=HOLE_NUMBERS)
    start_time = models.DateTimeField()
    stop_time = models.DateTimeField()
    geo_codes = ArrayField(models.DecimalField(max_digits=9, decimal_places=6))
