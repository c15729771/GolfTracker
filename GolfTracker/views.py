from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http.response import JsonResponse
from .models import Member, Game, Hole
import datetime
import json
#
# posts = [
#     {
#         'author': 'Killio',
#         'title': 'tester',
#         'content': 'Mre useless information',
# #         'date_posted': '27th of August 2018o'
#    },
#     {
#         'author': 'alo',
#         'title': 'tester2',
#         'content': 'More useless information again',
#         'date_posted': '14th of October 2018'
#     }
# ]

#@ login required redirects you to the login page if you havn't logged in already.
@login_required
def TrackNow(request):
    return render(request, 'Golf_Journal/TrackNow.html', {'title': 'TrackNow'})

#@ login required redirects you to the login page if you havn't logged in already.
@login_required
def CommunityCourses(request):
    return render(request, 'Golf_Journal/CommunityCourses.html', {'title': 'CommunityCourses'})

#@ login required redirects you to the login page if you havn't logged in already.
@login_required
def MyCourses(request):
    return render(request, 'Golf_Journal/MyCourses.html', {'title': 'MyCourses'})

def index(request):
    return render(request, 'Golf_Journal/index.html', {'title': 'index'})

def about(request):
    return render(request, 'Golf_Journal/about.html', {'title': 'about'})

def create(request):
    member = Member(firstname=request.POST['firstname'], lastname=request.POST['lastname'])
    member.save()
    return redirect('/')

def createGameEntry(request):
    game = Game(
        user = User(id=request.user.id) ,
        courseName=request.POST.get('courseName', 'Default'),
        location=request.POST['courseLocation'],
        datePlayed=request.POST.get('datePlayed', datetime.date.today())
    )
    game.save()
    return redirect('/')

def deleteGameEntry(request):
    id = request.POST.get('id', '')
    game = Game.objects.filter(id=id, user=request.user.id)[:1][0]
    game.delete()
    return redirect('/')

def read(request):
    members = Member.objects.all()
    context = {'members': members}
    return render(request, 'Golf_Journal/result.html', context)

#Returns the Golf Games currently stored in the system
def getGameEntries(request):
    games = Game.objects.filter(user=request.user.id)
    context = {'games': games}
    return render(request, 'Golf_Journal/GolfCourseTable.html', context)

#Returns a golf game record by Id
def getGameEntryById(request):
    gameId = request.POST.get('gameId', 'Default')
    game = Game.objects.filter(id=gameId, user=request.user.id)[:1][0]
    return JsonResponse({'success':True, 'gameName':game.courseName})

def getGameHolesByGameId(request):
    gameId = request.POST.get('gameId', 'Default')
    holes = Hole.objects.filter(game=gameId)
    context = {'holes': holes}
    return render(request, 'Golf_Journal/CourseHoleTable.html', context)

def saveCourseHole(request):
    gameId = request.POST.get('gameId', 'Default')
    geoCodes = request.POST.getlist('holeCoordinates[]')
    holeNumber = request.POST.get('holeName', 1)
    trackingStartTime = request.POST.get('recordingStartTime', 1)
    timeAsInt = int(trackingStartTime)
    hole = Hole(
        hole_number = holeNumber,
        game = Game(id=gameId),
        start_time = datetime.datetime.fromtimestamp(timeAsInt / 1e3),
        stop_time = datetime.datetime.now(),
        geo_codes = geoCodes
    )
    hole.save()
    return redirect('/')

def deleteGameHole(request):
    holeId = request.POST.get('id', 'Default')
    hole = Hole.objects.filter(id=holeId)[:1][0]
    hole.delete()
    return redirect('/')

def getHoleCoordinates(request):
    holeId = request.POST.get('id', 'Default')
    hole = Hole.objects.filter(id=holeId)[:1][0]
    return JsonResponse({'success':True, 'holeGeoCodes':hole.geo_codes})

def getNewHoleModal(request):
    HOLE_NUMBERS = [
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

    ]
    context = {'holeNumbers': HOLE_NUMBERS}
    return render(request, 'Golf_Journal/CreateCourseHoleModal.html', context)

def edit(request, id):
    members = Member.objects.get(id=id)
    context = {'member': members}
    return render(request, 'Golf_Journal/edit.html', context)


def update(request, id):
    member = Member.objects.get(id=id)
    member.firstname = request.POST['firstname']
    member.lastname = request.POST['lastname']
    member.save()
    return redirect('/Golf_Journal/')


def delete(request, id):
    member = Member.objects.get(id=id)
    member.delete()
    return redirect('/Golf_Journal/')
