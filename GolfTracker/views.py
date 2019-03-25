from django.shortcuts import render, redirect
from .models import Member

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
def index(request):
    return render(request, 'Golf_Journal/index.html', {'title': 'index'})


def about(request):
    return render(request, 'Golf_Journal/about.html', {'title': 'about'})


def TrackNow(request):
    return render(request, 'Golf_Journal/TrackNow.html', {'title': 'TrackNow'})


def CommunityCourses(request):
    return render(request, 'Golf_Journal/CommunityCourses.html', {'title': 'CommunityCourses'})


def MyCourses(request):
    return render(request, 'Golf_Journal/MyCourses.html', {'title': 'MyCourses'})

def create(request):
    member = Member(firstname=request.POST['firstname'], lastname=request.POST['lastname'])
    member.save()
    return redirect('/')

def read(request):
    members = Member.objects.all()
    context = {'members': members}
    return render(request, 'Golf_Journal/result.html', context)

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
