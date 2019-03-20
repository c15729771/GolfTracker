from django.shortcuts import render


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
    # context = {
    #     'posts': posts
    # }
    return render(request, 'Golf_Journal/index.html', {'title': 'index'})


def about(request):
    return render(request, 'Golf_Journal/about.html', {'title': 'about'})


def TrackNow(request):
    return render(request, 'Golf_Journal/TrackNow.html', {'title': 'TrackNow'})


def CommunityCourses(request):
    return render(request, 'Golf_Journal/CommunityCourses.html', {'title': 'CommunityCourses'})


def MyCourses(request):
    return render(request, 'Golf_Journal/MyCourses.html', {'title': 'MyCourses'})
