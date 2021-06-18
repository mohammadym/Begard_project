from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField

from .managers.managers import BegardUserManager


class BegardUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    is_staff = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    is_public = models.BooleanField(default=True)
    profile_img = models.ImageField(default='profiles/defaults/user-profile-image.jpg', upload_to='profiles', null=True)
    average_rate = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    username = models.TextField(max_length=50, null=True, blank=True)
    is_admin = True

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = BegardUserManager()

    def __str__(self):
        return self.email

    @property
    def is_superuser(self):
        return self.is_admin

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

    @is_staff.setter
    def is_staff(self, value):
        self._is_staff = value


class City(models.Model):
    name = models.CharField(max_length=100, null=True)

    def ___str__(self):
        return self.name


class Plan(models.Model):
    user = models.ForeignKey(BegardUser, on_delete=models.CASCADE)
    destination_city = models.ForeignKey(City, on_delete=models.CASCADE)
    description = models.TextField()
    is_public = models.BooleanField(default=True)
    creation_date = models.DateTimeField()
    start_date = models.DateTimeField()
    finish_date = models.DateTimeField()


class PlanItem(models.Model):
    place_id = models.CharField(max_length=300)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    finish_date = models.DateTimeField()


class Post(models.Model):
    POST_TYPES = [
        ('plan_post', 'plan_post'),
        ('location_post', 'location_post')
    ]

    type = models.CharField(max_length=30, choices=POST_TYPES)
    user = models.ForeignKey(BegardUser, on_delete=models.CASCADE)
    plan_id = models.ForeignKey(Plan, on_delete=models.CASCADE, null=True, blank=True)
    creation_date = models.DateTimeField()
    content = models.TextField(max_length=500, default='This is my post')
    place_id = models.CharField(null=True, max_length=100, blank=True)
    place_name = models.CharField(null=True, max_length=200, blank=True)
    rate = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)


class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images')


class Comment(models.Model):
    user = models.ForeignKey(BegardUser, on_delete=models.CASCADE)
    content = models.TextField(max_length=200)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)


class UserFollowing(models.Model):
    user_id = models.ForeignKey("BegardUser", related_name="following", on_delete=models.CASCADE)
    following_user_id = models.ForeignKey("BegardUser", related_name="followers", on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_id", "following_user_id")
        ordering = ["-created"]


class Like(models.Model):
    user = models.ForeignKey(BegardUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)


class FollowRequest(models.Model):
    request_from = models.ForeignKey(BegardUser, related_name="request_from", on_delete=models.CASCADE)
    request_to = models.ForeignKey(BegardUser, related_name="request_to", on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("request_from", "request_to")
        ordering = ['-date']


class Place(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True,)
    place_id = models.CharField(max_length=500, primary_key=True, default="none")
    name = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    address = models.TextField(default="Nothing")
    photo_ref = models.TextField(default="Nothing")
    lng = models.DecimalField(max_digits=13, decimal_places=9, null=True)
    lat = models.DecimalField(max_digits=13, decimal_places=9, null=True)

    class Meta:
        abstract = True


class Restaurant(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class Hotel(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class Museum(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class TouristAttraction(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class RecreationalPlace(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class Cafe(Place):

    def __str__(self):
        return self.city.name+"-"+self.name


class ShoppingMall(Place):

    def __str__(self):
        return self.city.name + "-" + self.name
