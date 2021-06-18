from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import BegardUser


class BegardUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm):
        model = BegardUser
        fields = ('email',)


class BegardUserChangeForm(UserChangeForm):

    class Meta:
        model = BegardUser
        fields = ('email',)
