from __future__ import unicode_literals
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import BegardUserCreationForm, BegardUserChangeForm
from .models import *


class BegardUserAdmin(UserAdmin):
    add_form = BegardUserCreationForm
    form = BegardUserChangeForm
    model = BegardUser
    list_display = ('email', 'date_joined', 'profile_img')
    list_filter = ('email', 'date_joined')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('date_joined', 'is_public', 'profile_img')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')}
         ),
    )
    search_fields = ('email',)
    ordering = ('email',)


admin.site.register(BegardUser, BegardUserAdmin)


class CityAdmin(admin.ModelAdmin):
    model = City
    list_display = ('name',)


admin.site.register(City, CityAdmin)


class RestaurantAdmin(admin.ModelAdmin):
    model = Restaurant
    list_display = ('name', 'city')


admin.site.register(Restaurant, RestaurantAdmin)


class PlanAdmin(admin.ModelAdmin):
    model = Plan
    list_display = ('user', 'destination_city')


admin.site.register(Plan, PlanAdmin)


class PlanItemAdmin(admin.ModelAdmin):
    model = PlanItem
    list_display = ('plan', 'start_date')


admin.site.register(PlanItem, PlanItemAdmin)


class HotelAdmin(admin.ModelAdmin):
    model = Hotel
    list_display = ('name', 'city')


admin.site.register(Hotel, HotelAdmin)


class ShoppingMallAdmin(admin.ModelAdmin):
    model = ShoppingMall
    list_display = ('name', 'city')


admin.site.register(ShoppingMall, ShoppingMallAdmin)


class CafeAdmin(admin.ModelAdmin):
    model = Cafe
    list_display = ('name', 'city')


admin.site.register(Cafe, CafeAdmin)


class RecreationalPlaceAdmin(admin.ModelAdmin):
    model = RecreationalPlace
    list_display = ('name', 'city')


admin.site.register(RecreationalPlace, RecreationalPlaceAdmin)


class TouristAttractionAdmin(admin.ModelAdmin):
    model = TouristAttraction
    list_display = ('name', 'city')


admin.site.register(TouristAttraction, TouristAttractionAdmin)


class MuseumAdmin(admin.ModelAdmin):
    model = Museum
    list_display = ('name', 'city')


admin.site.register(Museum, MuseumAdmin)


class PostAdmin(admin.ModelAdmin):
    model = Post
    list_display = ('type', 'user', 'creation_date')


admin.site.register(Post, PostAdmin)


class CommentAdmin(admin.ModelAdmin):
    model = Comment
    list_display = ('user', 'post', 'content')


admin.site.register(Comment, CommentAdmin)


class UserFollowingAdmin(admin.ModelAdmin):
    model = UserFollowing
    list_display = ('user_id', 'following_user_id', 'created')


admin.site.register(UserFollowing, UserFollowingAdmin)


class LikeAdmin(admin.ModelAdmin):
    model = Like
    list_display = ('user', 'post', 'date')


admin.site.register(Like, LikeAdmin)


class FollowRequestAdmin(admin.ModelAdmin):
    model = FollowRequest
    list_display = ('request_from', 'request_to', 'date')


admin.site.register(FollowRequest, FollowRequestAdmin)


class ImageAdmin(admin.ModelAdmin):
    model = Image
    list_display = ('post', 'image')


admin.site.register(Image, ImageAdmin)
