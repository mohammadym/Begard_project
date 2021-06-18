from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound

from .models import *
from .models import BegardUser
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from django.shortcuts import get_object_or_404

from django.core.files.base import ContentFile
import base64
import six
import uuid
import imghdr


class SuggestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'


class MuseumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Museum
        fields = '__all__'


class HistoricalPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TouristAttraction
        fields = '__all__'


class RecreationalPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecreationalPlace
        fields = '__all__'


class CafeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = '__all__'


class ShoppingMallSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingMall
        fields = '__all__'


class TouristAttractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TouristAttraction
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = BegardUser
        fields = 'email'


class CustomUserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BegardUser
        fields = ('email', 'pk', 'profile_img')
        read_only_fields = ('email',)


class PlanItemSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        result = super(PlanItemSerializer, self).to_representation(instance)
        place_id = instance.place_id

        places = list(Restaurant.objects.filter(place_id=place_id))
        places += list(Hotel.objects.filter(place_id=place_id))
        places += list(Museum.objects.filter(place_id=place_id))
        places += list(TouristAttraction.objects.filter(place_id=place_id))
        places += list(RecreationalPlace.objects.filter(place_id=place_id))
        places += list(Cafe.objects.filter(place_id=place_id))
        places += list(ShoppingMall.objects.filter(place_id=place_id))

        if len(places) == 0:
            raise NotFound("any Location not found.")

        result['place_info'] = {}
        result['place_info']['id'] = place_id
        result['place_info']['lat'] = places[0].lat
        result['place_info']['lng'] = places[0].lng
        result['place_name'] = places[0].name
        result.pop('place_id')

        return result

    class Meta:
        model = PlanItem
        fields = ['id', 'place_id', 'plan', 'start_date', 'finish_date']


class PlanSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        result = super(PlanSerializer, self).to_representation(instance)
        result.pop('destination_city')
        result['destination_city_id'] = instance.destination_city.id
        result['destination_city_name'] = instance.destination_city.name
        post = get_object_or_404(Post, plan_id=instance.id, type='plan_post')
        result['cover'] = get_object_or_404(Image, post=post.id).image.url

        return result

    class Meta:
        model = Plan
        fields = ['id', 'user', 'destination_city', 'description', 'creation_date', 'start_date', 'finish_date']


class UpdatePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'description', 'is_public', 'start_date', 'finish_date']


class PlanItemListSerializer(serializers.ListSerializer):
    def update(self, instance, validated_data):
        for i in range(len(instance)):
            self.validated_data[i]['plan'] = self.validated_data[i]['plan'].id
            serializer = PlanItemSerializer(instance[i], self.validated_data[i])
            if serializer.is_valid(raise_exception=True):
                serializer.save()

        return instance


class PatchPlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanItem
        fields = '__all__'
        list_serializer_class = PlanItemListSerializer


class GlobalSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

    def to_native(self, obj):
        if isinstance(obj, Restaurant):
            serializer = RestaurantSerializer(obj)
        elif isinstance(obj, Hotel):
            serializer = HotelSerializer(obj)
        elif isinstance(obj, Museum):
            serializer = MuseumSerializer(obj)
        elif isinstance(obj, Cafe):
            serializer = CafeSerializer(obj)
        elif isinstance(obj, ShoppingMall):
            serializer = ShoppingMallSerializer(obj)
        elif isinstance(obj, TouristAttraction):
            serializer = TouristAttractionSerializer(obj)
        elif isinstance(obj, RecreationalPlace):
            serializer = RecreationalPlaceSerializer(obj)
        else:
            raise Exception("Neither a model instance!")
        return serializer.data


class AdvancedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'


class SavePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class ShowPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class FollowingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollowing
        fields = '__all__'


class ListOfFollowingsSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        result = super(ListOfFollowingsSerializer, self).to_representation(instance)
        user = instance.following_user_id
        result['id'] = result.pop('following_user_id')
        result['profile_img'] = user.profile_img.url
        result['username'] = user.email
        return result

    class Meta:
        model = UserFollowing
        fields = ['following_user_id']


class ListOfFollowersSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        result = super(ListOfFollowersSerializer, self).to_representation(instance)
        user = instance.user_id
        result['id'] = result.pop('user_id')
        result['profile_img'] = user.profile_img.url
        result['username'] = user.email
        return result

    class Meta:
        model = UserFollowing
        fields = ['user_id']


class CreateLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'


class FollowingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowRequest
        fields = '__all__'


class FollowersRequestsSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        result = super(FollowersRequestsSerializer, self).to_representation(instance)
        from_user = instance.request_from
        result['profile_img'] = from_user.profile_img.url
        result['username'] = from_user.email
        return result

    class Meta:
        model = FollowRequest
        fields = ['id', 'request_from', 'date']


class TopPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        exclude = ['type', 'content', 'place_name', 'place_id']


class LocationPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class Base64ImageField(serializers.ImageField):

    def to_internal_value(self, data):
        if isinstance(data, six.string_types):
            if 'data:' in data and ';base64,' in data:
                header, data = data.split(';base64,')
            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')
            file_name = str(uuid.uuid4())[:12]
            file_extension = self.get_file_extension(file_name, decoded_file)
            complete_file_name = "%s.%s" % (file_name, file_extension,)
            data = ContentFile(decoded_file, name=complete_file_name)
        return super(Base64ImageField, self).to_internal_value(data)

    def get_file_extension(self, file_name, decoded_file):

        extension = imghdr.what(file_name, decoded_file)
        extension = "jpg" if extension == "jpeg" else extension

        return extension


class ImageSerializer(serializers.ModelSerializer):
    image = Base64ImageField()

    class Meta:
        model = Image
        fields = ['image', 'post']

    def create(self, validated_data):
        image = validated_data.pop('image')
        data = validated_data.pop('post')
        return Image.objects.create(post=data, image=image)


class TopPlannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BegardUser
        fields = ['email', 'average_rate', 'username', 'profile_img', 'is_public', 'pk']


class MyPlansSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(MyPlansSerializer, self).to_representation(instance)

        post = get_object_or_404(Post, plan_id=ret['id'], type='plan_post')
        image = get_object_or_404(Image, post=post)
        ret['cover'] = image.image.url
        ret.pop('destination_city')
        ret['destination_city_id'] = instance.destination_city.id
        ret['destination_city_name'] = instance.destination_city.name

        return ret

    class Meta:
        model = Plan
        fields = ['id', 'destination_city', 'creation_date']


class LocationOfPlanSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        result = super(LocationOfPlanSerializer, self).to_representation(instance)
        place_id = result['place_id']

        places = list(Restaurant.objects.filter(place_id=place_id))

        places += list(Hotel.objects.filter(place_id=place_id))
        places += list(Museum.objects.filter(place_id=place_id))
        places += list(TouristAttraction.objects.filter(place_id=place_id))
        places += list(RecreationalPlace.objects.filter(place_id=place_id))
        places += list(Cafe.objects.filter(place_id=place_id))
        places += list(ShoppingMall.objects.filter(place_id=place_id))

        if len(places) == 0:
            raise NotFound("any Location not found.")

        result['place_name'] = places[0].name

        return result

    class Meta:
        model = PlanItem
        fields = ['id', 'place_id']


class UserPlansSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        result = super(UserPlansSerializer, self).to_representation(instance)
        post = get_object_or_404(Post, plan_id=result['id'], type='plan_post')
        image = get_object_or_404(Image, post=post)
        result['cover'] = image.image.url
        result.pop('destination_city')
        result.pop('user')
        result['destination_city_id'] = instance.destination_city.id
        result['destination_city_name'] = instance.destination_city.name
        return result

    class Meta:
        model = Plan
        fields = ['id', 'destination_city', 'creation_date', 'user']
