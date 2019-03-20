from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm


def register(request):
    # Validate form data looks after post
    # request form user entering register details
    # if valid User is created it gives a flash message
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()  # Saves entered user to admin page
            username = form.cleaned_data.get('username')
            messages.success(request, f'You have registered and are now able login!')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


@login_required
def myprofile(request):
    return render(request, 'users/myprofile.html')
