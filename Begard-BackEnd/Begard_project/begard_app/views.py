import datetime
import enum
import os
from itertools import chain

from django.views.generic import TemplateView
from django.shortcuts import render
from django.db.models import Q
from django.http import JsonResponse
from django.http.response import HttpResponseBadRequest
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models, serializers
from .permissions import *
from .managers.time_table import TimeTable
from .serializers import PlanItemSerializer, PlanSerializer, GlobalSearchSerializer, AdvancedSearchSerializer, \
    SavePostSerializer, ShowPostSerializer, FollowingsSerializer, TopPostSerializer, LocationPostSerializer, \
    UserPlansSerializer, ImageSerializer, TopPlannerSerializer, CustomUserDetailsSerializer


class ActionOnFollowRequestType(enum.Enum):
    accept = 1,
    reject = 2


class FollowingState(enum.Enum):
    Follow = 1,
    Following = 2,
    Requested = 3,
    Own = 4


class HomePageView(TemplateView):
    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)


class CitiesListView(generics.ListAPIView):
    """List of cities in database, include name and id"""
    queryset = models.City.objects.all()
    serializer_class = serializers.CitySerializer
    permission_classes = [AllowAny]


class SuggestListView(generics.ListAPIView):
    """List of some suggestion according to selected city"""
    serializer_class = serializers.SuggestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        city_id = self.kwargs.get('id')
        city = get_object_or_404(models.City, pk=city_id)
        queryset = list(models.Restaurant.objects.filter(city=city).order_by('-rating')[0:3])
        queryset += models.RecreationalPlace.objects.filter(city=city).order_by('-rating')[0:3]
        queryset += models.Museum.objects.filter(city=city).order_by('-rating')[0:3]

        return queryset


class SuggestPlanView(generics.RetrieveAPIView):
    """Get a plan suggestion to user"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        dest_city = models.City.objects.get(pk=self.kwargs.get('id'))
        start_day = datetime.datetime.strptime(self.request.query_params.get('start_date'), "%Y-%m-%dT%H:%MZ")
        finish_day = datetime.datetime.strptime(self.request.query_params.get('finish_date'), "%Y-%m-%dT%H:%MZ")

        result = self.get_plan(dest_city, start_day, finish_day)

        return JsonResponse(data=result, status=status.HTTP_200_OK)

    def get_plan(self, dest_city, start_date, finish_date):
        time_table = TimeTable(start_date, finish_date)
        time_table.create_table(120, 60)
        time_table.tagging()
        time_table.set_places(dest_city)
        plan = time_table.get_json_table()

        return plan


class PlansView(generics.ListCreateAPIView):
    serializer_class = serializers.PlanSerializer
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        plans = models.Plan.objects.filter(user=self.request.user)
        data = serializers.MyPlansSerializer(instance=plans, many=True).data

        return Response(data=data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not request.data.get('plan_items'):
            return HttpResponseBadRequest("Error : The plan items doesn't exist.")
        if not request.data.get('image'):
            return HttpResponseBadRequest("Error : The cover image doesn't exist.")
        if not request.data.get('description'):
            return HttpResponseBadRequest("Error : The description doesn't exist.")
        plan = self.create_plan(request.data)
        self.create_plan_items(request.data['plan_items'], plan.id)
        request.data['content'] = request.data['description']
        post = self.save_post(request.data, plan.id)
        post_id = post.pk
        image = request.data['image']
        modified_data = {'post': post_id, 'image': image}
        serializer = ImageSerializer(data=modified_data)
        if serializer.is_valid(True):
            serializer.save()
        return Response(status=status.HTTP_200_OK)

    def create_plan_items(self, plan_items, plan_id):
        for item in plan_items:
            item['plan'] = plan_id
            serializer = PlanItemSerializer(data=item)
            if serializer.is_valid(True):
                serializer.save()

    def create_plan(self, plan_dict):
        plan_dict['user'] = self.request.user.id
        plan_dict['creation_date'] = datetime.datetime.now()
        serializer = PlanSerializer(data=plan_dict)
        if serializer.is_valid(True):
            plan = serializer.save()
            return plan
        return None

    def save_post(self, data, plan_id):
        data['type'] = 'plan_post'
        data['creation_date'] = datetime.datetime.now()
        data['user'] = self.request.user.id
        data['plan_id'] = plan_id
        serializer = SavePostSerializer(data=data)
        if serializer.is_valid(True):
            return serializer.save()


class GetUpdateDeletePlanView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny, GetUpdateDeletePlanPermission]

    def get(self, request, *args, **kwargs):
        plan_id = self.kwargs.get('id')
        plan = get_object_or_404(models.Plan, pk=plan_id)

        plan_details = serializers.PlanSerializer(instance=plan).data
        plan_details['plan_items'] = []

        plan_items = models.PlanItem.objects.filter(plan=plan)
        for plan_item in plan_items:
            plan_item_details = serializers.PlanItemSerializer(plan_item).data
            plan_item_details.pop('plan')
            plan_details['plan_items'].append(plan_item_details)

        return Response(data=plan_details)

    def patch(self, request, *args, **kwargs):
        if not self.request.data.get('plan_items'):
            return HttpResponseBadRequest("error: field 'plan_items' is required.")
        
        plan_items = self.request.data['plan_items']
        plan_id = self.kwargs.get('id')
        plan = get_object_or_404(models.Plan, id=plan_id)

        if self.request.data.get('cover'):
            post = get_object_or_404(models.Post, type='plan_post', plan_id=plan_id)
            image = get_object_or_404(models.Image, post=post.id)
            os.remove(image.image.path)
            image.delete()

            data = {'image': self.request.data.get('cover'), 'post': post.id}
            serializer = ImageSerializer(data=data)
            if serializer.is_valid(True):
                serializer.save()

        plan_detail = self.request.data
        plan_detail['id'] = plan_id

        plan_detail.pop('plan_items')

        plan_serializer = serializers.UpdatePlanSerializer(instance=plan, data=plan_detail, partial=True)
        if plan_serializer.is_valid(True):
            plan_serializer.save()

        plan_items_create_data = []
        plan_items_update_data = []
        plan_items_update_id = []
        instances = []
        for plan_item in plan_items:
            plan_item['plan'] = plan_id
            plan_item_id = plan_item.get('id')
            if plan_item_id is None:
                plan_items_create_data.append(plan_item)
            else:
                plan_items_update_data.append(plan_item)
                plan_items_update_id.append(plan_item_id)
                instances.append(get_object_or_404(models.PlanItem, pk=plan_item_id))

        serializer = serializers.PatchPlanItemSerializer(instance=instances,
                                                         data=plan_items_update_data, many=True)
        if serializer.is_valid(True):
            serializer.save()

        models.PlanItem.objects.filter(plan=plan_id).exclude(id__in=plan_items_update_id).delete()

        serializer = serializers.PatchPlanItemSerializer(data=plan_items_create_data, many=True)
        if serializer.is_valid(True):
            serializer.save()

        return Response()

    def delete(self, request, *args, **kwargs):
        models.Plan.objects.filter(pk=self.kwargs.get('id')).delete()
        return Response()


class GlobalSearchList(generics.ListAPIView):
    serializer_class = GlobalSearchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        city_id = self.kwargs.get('id')
        city = get_object_or_404(models.City, pk=city_id)
        query = self.request.query_params.get('query', None)
        restaurants = models.Restaurant.objects.filter(Q(name__icontains=query) & Q(city=city))
        museums = models.Museum.objects.filter(Q(name__icontains=query) & Q(city=city))
        cafes = models.Cafe.objects.filter(Q(name__icontains=query) & Q(city=city))
        recreationalplaces = models.RecreationalPlace.objects.filter(Q(name__icontains=query) & Q(city=city))
        touristattractions = models.TouristAttraction.objects.filter(Q(name__icontains=query) & Q(city=city))
        hotels = models.Hotel.objects.filter(Q(name__icontains=query) & Q(city=city))
        shoppingmalls = models.ShoppingMall.objects.filter(Q(name__icontains=query) & Q(city=city))
        all_results = list(chain(restaurants, museums, cafes, recreationalplaces,
                                 touristattractions, hotels, shoppingmalls))
        return all_results


class LocationTypes(enum.Enum):
    Restaurant = 1
    Museum = 2
    Cafe = 3
    Hotel = 4
    RecreationalPlace = 5
    TouristAttraction = 6
    ShoppingMall = 7


class AdvancedSearch(generics.CreateAPIView):
    serializer_class = AdvancedSearchSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        all_result = self.get_queryset(request.data)
        return Response(data=all_result)

    def get_queryset(self, data):
        city_id = self.kwargs.get('id')
        city = models.City.objects.get(pk=city_id)
        rate = data['rate']
        for type_loc in data['types']:
            if type_loc == LocationTypes.Restaurant.value:
                all_results = list(models.Restaurant.objects.filter(Q(rating__gte=rate) & Q(city=city)))
            elif type_loc == LocationTypes.Museum.value:
                all_results += models.Museum.objects.filter(Q(rating__gte=rate) & Q(city=city))
            elif type_loc == LocationTypes.Hotel.value:
                all_results += models.Hotel.objects.filter(Q(rating__gte=rate) & Q(city=city))
            elif type_loc == LocationTypes.Cafe.value:
                all_results += models.Cafe.objects.filter(Q(rating__gte=rate) & Q(city=city))
            elif type_loc == LocationTypes.RecreationalPlace.value:
                all_results += models.RecreationalPlace.objects.filter(Q(rating__gte=rate) & Q(city=city))
            elif type_loc == LocationTypes.TouristAttraction.value:
                all_results += models.TouristAttraction.objects.filter(Q(rating__gte=rate) & Q(city=city))
            elif type_loc == LocationTypes.ShoppingMall.value:
                all_results += models.ShoppingMall.objects.filter(Q(rating__gte=rate) & Q(city=city))

        return all_results


class ShowPostView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ShowPostSerializer

    def get_queryset(self):
        user = self.request.user.id
        following_users = [item['following_user_id'] for item in
                           models.UserFollowing.objects.filter(user_id=user).values('following_user_id')]
        return following_users

    def get(self, request, *args, **kwargs):
        user = self.request.user.id
        following_users = self.get_queryset()
        if not self.request.query_params.get('page').isdigit():
            return HttpResponseBadRequest("Error : the page number is not correct.")
        page_number = int(self.request.query_params.get('page'))
        posts = models.Post.objects.filter(Q(user=user) | Q(user__in=following_users) |
                                           Q(user__is_public=True)).order_by('-creation_date')[(page_number - 1)
                                                                                               * 20:page_number * 20]
        posts_data = serializers.ShowPostSerializer(instance=posts, many=True).data
        for data in posts_data:
            data['destination_city'] = get_object_or_404(models.Plan, id=data['plan_id']).destination_city.name
            data['user_name'] = get_object_or_404(models.BegardUser, id=data['user']).email
            data['user_profile_image'] = get_object_or_404(models.BegardUser, id=data['user']).profile_img.url
            data['number_of_likes'] = models.Like.objects.filter(post=data['id']).count()
            data['number_of_comments'] = models.Comment.objects.filter(post=data['id']).count()
            data['is_liked'] = models.Like.objects.filter(Q(user=user) & Q(post=data['id'])).exists()
            images = models.Image.objects.filter(post=data['id'])
            data['images'] = [image.image.url for image in images]
            if data['user'] == user:
                data['following_state'] = FollowingState.Own.name
            elif data['user'] in following_users:
                data['following_state'] = FollowingState.Following.name
            else:
                data['following_state'] = FollowingState.Follow.name

        return Response(posts_data, status=status.HTTP_200_OK)


class SearchPostView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShowPostSerializer

    def get(self, request, *args, **kwargs):
        user_following = self.get_queryset()
        if not (self.request.query_params.get('city')).isdigit():
            return Response(data={"error: ": "the page number is not correct."}, status=status.HTTP_400_BAD_REQUEST)
        city = self.request.query_params.get('city', None)
        plans = models.Plan.objects.filter(destination_city=city)
        queryset = models.Post.objects.filter((Q(plan_id__in=plans) & Q(user__id__in=user_following)) |
                                              (Q(plan_id__in=plans) & Q(user__is_public=True)))
        return Response(data=queryset, status=status.HTTP_200_OK)

    def get_queryset(self):
        user = self.request.user.id
        user_following = models.UserFollowing.objects.filter(user_id=user)
        return user_following


class CommentsOnPostView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, LikeAndCommentOnPostPermission]
    serializer_class = serializers.CreateCommentSerializer

    def get(self, request, *args, **kwargs):
        post_id = self.kwargs.get('id')
        comments = models.Comment.objects.filter(post=post_id)
        serializer_data = serializers.CreateCommentSerializer(instance=comments, many=True).data
        for data in serializer_data:
            user = models.BegardUser.objects.get(id=data['user'])
            data['user_name'] = user.email
            data['user_profile_img'] = user.profile_img.url

        return Response(data=serializer_data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        data = self.request.data
        data['post'] = self.kwargs.get('id')
        data['user'] = self.request.user.id
        post = get_object_or_404(models.Post, id=data['post'])

        comment_serializer = serializers.CreateCommentSerializer(data=data)
        comment = None
        if comment_serializer.is_valid(True):
            comment = comment_serializer.save()

        comment_data = serializers.CreateCommentSerializer(instance=comment).data
        user = get_object_or_404(models.BegardUser, id=comment_data['user'])
        comment_data['user_name'] = user.email
        comment_data['user_profile_img'] = user.profile_img.url

        return Response(data=comment_data, status=status.HTTP_201_CREATED)


class ListOfFollowingsView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FollowingsSerializer

    def get_queryset(self):
        user = self.request.user.id
        return models.UserFollowing.objects.filter(user_id=user)


class DeleteFollowingsView(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, *args, **kwargs):
        user_id = self.request.user.id
        following_user_id = self.kwargs.get('id')
        instance = get_object_or_404(models.UserFollowing, user_id=user_id, following_user_id=following_user_id)
        instance.delete()
        return Response()


class FollowersView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FollowingsSerializer

    def get_queryset(self):
        user = self.request.user.id
        queryset = models.UserFollowing.objects.filter(Q(following_user_id=user))
        return queryset


class LikeOnPostView(generics.ListCreateAPIView, generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, LikeAndCommentOnPostPermission]
    serializer_class = serializers.CreateLikeSerializer

    def get(self, request, *args, **kwargs):
        post_id = self.kwargs.get('id')
        user_id = self.request.user.id
        like_numbers = models.Like.objects.filter(post=post_id).count()
        is_liked = models.Like.objects.filter(Q(user=user_id) & Q(post=post_id)).exists()
        return Response(data={'like_numbers': like_numbers, 'is_liked': is_liked}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        data = {
            'user': self.request.user.id,
            'post': self.kwargs.get('id')
        }

        post = get_object_or_404(models.Post, id=data['post'])

        exist_like = models.Like.objects.filter(Q(user=data['user']) & Q(post=data['post'])).exists()
        if exist_like:
            return HttpResponseBadRequest("this post is liked by you.now you are trying to like again.")

        serializer = serializers.CreateLikeSerializer(data=data)
        if serializer.is_valid(True):
            serializer.save()

        return Response()

    def delete(self, request, *args, **kwargs):
        data = {
            'user': self.request.user.id,
            'post': self.kwargs.get('id')
        }
        post = get_object_or_404(models.Post, id=data['post'])

        like = models.Like.objects.filter(Q(user=data['user']) & Q(post=post.id))
        if like.exists():
            like.delete()

        return Response()


class FollowingRequestView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        data = self.request.data
        data['request_from'] = self.request.user.id

        if not (data.get('request_to') and isinstance(data['request_to'], int)):
            return HttpResponseBadRequest("field 'request_to' with a digit required.")

        if models.UserFollowing.objects.filter(user_id=data['request_from'],
                                               following_user_id=data['request_to']).exists():
            return HttpResponseBadRequest('this user is followed by you, you can not request to follow this user')

        request_to_user = get_object_or_404(models.BegardUser, id=data['request_to'])

        if request_to_user.is_public:
            follow_user_data = {"user_id": data['request_from'], "following_user_id": data['request_to']}
            serializer = serializers.FollowingsSerializer(data=follow_user_data)
            if serializer.is_valid(True):
                serializer.save()
                return Response(data={"status": "Followed", "follow_request_id": None},
                                status=status.HTTP_201_CREATED)
        else:
            serializer = serializers.FollowingRequestSerializer(data=data)
            if serializer.is_valid(True):
                follow_request = serializer.save()
                return Response(data={"status": "Requested", "follow_request_id": follow_request.id},
                                status=status.HTTP_201_CREATED)

        return Response(status.HTTP_406_NOT_ACCEPTABLE)


class FollowersRequestsView(generics.ListAPIView):
    """get list of followers requests"""
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.FollowersRequestsSerializer

    def get_queryset(self):
        user = self.request.user
        return models.FollowRequest.objects.filter(request_to=user)


class AnswerFollowRequestView(generics.UpdateAPIView):
    """Accept or reject a follow request"""
    permission_classes = [IsAuthenticated, AnswerFollowRequestPermission]

    def get_object(self):
        follow_request = get_object_or_404(models.FollowRequest, id=self.kwargs.get('id'))
        self.check_object_permissions(request=self.request, obj=follow_request)
        return follow_request

    def patch(self, request, *args, **kwargs):
        follow_request = self.get_object()

        action = self.request.query_params.get('action')

        if not ((action == ActionOnFollowRequestType.accept.name) or (action == ActionOnFollowRequestType.reject.name)):
            return HttpResponseBadRequest("error: problem in query params.")

        if action == ActionOnFollowRequestType.accept.name:
            data = {'user_id': follow_request.request_from_id, 'following_user_id': follow_request.request_to_id}
            serializer = serializers.FollowingsSerializer(data=data)
            if serializer.is_valid(True):
                serializer.save()

        follow_request.delete()
        return Response()


class DeleteFollowRequestView(generics.DestroyAPIView):
    """Delete a follow request"""
    permission_classes = [IsAuthenticated, DeleteFollowRequestPermission]

    def get_object(self):
        follow_request = get_object_or_404(models.FollowRequest, id=self.kwargs.get('id'))
        self.check_object_permissions(request=self.request, obj=follow_request)
        return follow_request


class TopPostsView(generics.ListAPIView):
    serializer_class = TopPostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = models.Post.objects.filter(Q(user__is_public=True) & Q(type='plan_post')).order_by('-rate')[0:20]
        return queryset

    def get(self, request, *args, **kwargs):
        posts = self.get_queryset()
        posts_data = serializers.TopPostSerializer(instance=posts, many=True).data
        for data in posts_data:
            data['city'] = get_object_or_404(models.Plan, id=data['plan_id']).destination_city.name
            data['user_name'] = get_object_or_404(models.BegardUser, id=data['user']).email
            data['profile_image'] = get_object_or_404(models.BegardUser, id=data['user']).profile_img.url
            data['cover'] = get_object_or_404(models.Image, post__pk=data['id']).image.url
        return Response(posts_data, status=status.HTTP_200_OK)


class LocationPostView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LocationPostSerializer

    def post(self, request, *args, **kwargs):
        if not self.request.data.get('image'):
            return HttpResponseBadRequest("the images does not exists.")
        images = request.data['image']
        post = self.save_post(request.data)
        post_id = post.pk
        for image in images:
            modified_data = self.modify_input_for_multiple_files(image['image'], post_id)
            serializer = ImageSerializer(data=modified_data)
            if serializer.is_valid(True):
                serializer.save()

        response_data = self.get_last_post(post)
        return Response(data=response_data, status=status.HTTP_200_OK)

    def get_last_post(self, post):
        data = serializers.ShowPostSerializer(instance=post).data
        data['user_name'] = post.user.email
        data['user_profile_image'] = post.user.profile_img.url
        data['destination_city'] = post.plan_id.destination_city.name
        data['number_of_likes'] = models.Like.objects.filter(post=post.id).count()
        data['is_liked'] = models.Like.objects.filter(post=post.id, user=self.request.user).exists()

        images = models.Image.objects.filter(post=post.id)
        data['images'] = [image.image.url for image in images]
        data['following_state'] = FollowingState.Own.name
        data['number_of_comments'] = models.Comment.objects.filter(post=post.id).count()
        return data

    def modify_input_for_multiple_files(self, image, post):
        list_element = {'post': post, 'image': image}
        return list_element

    def save_post(self, data):
        data['creation_date'] = datetime.datetime.now()
        data['user'] = self.request.user.id
        serializer = LocationPostSerializer(data=data)
        if serializer.is_valid(True):
            return serializer.save()


class ProfileDetailsView(generics.RetrieveAPIView):
    """Get profile details of a user"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        source_user = self.request.user
        target_user = get_object_or_404(models.BegardUser, id=self.kwargs.get('id'))

        data = dict()
        data['username'] = target_user.email
        data['profile_image'] = target_user.profile_img.url
        data['posts_count'] = models.Post.objects.filter(user=target_user).count()
        data['followings_count'] = models.UserFollowing.objects.filter(user_id=target_user).count()
        data['followers_count'] = models.UserFollowing.objects.filter(following_user_id=target_user).count()
        data['follow_request_id'] = None

        if source_user == target_user:
            following_state = FollowingState.Own.name
        elif models.UserFollowing.objects.filter(user_id=source_user.id, following_user_id=target_user).exists():
            following_state = FollowingState.Following.name
        elif models.FollowRequest.objects.filter(request_from=source_user.id, request_to=target_user).exists():
            following_state = FollowingState.Requested.name
            data['follow_request_id'] = get_object_or_404(models.FollowRequest, request_from=source_user.id,
                                                          request_to=target_user).id
        else:
            following_state = FollowingState.Follow.name

        data['following_state'] = following_state

        return Response(data=data, status=status.HTTP_200_OK)


class UserPostsView(generics.ListAPIView):
    """List of posts of a user"""
    serializer_class = serializers.ShowPostSerializer
    permission_classes = [AllowAny, AllowGetUserPosts]

    def get_queryset(self):
        target_user = get_object_or_404(models.BegardUser, id=self.kwargs.get('id'))
        return models.Post.objects.filter(user=target_user)

    def get(self, request, *args, **kwargs):
        target_user = get_object_or_404(models.BegardUser, id=self.kwargs.get('id'))
        source_user = self.request.user

        self.queryset = self.get_queryset()

        posts = list(self.queryset)
        serializer_data = ShowPostSerializer(instance=self.queryset, many=True).data

        for i in range(len(self.queryset)):
            serializer_data[i]['user_name'] = posts[i].user.email
            serializer_data[i]['user_profile_image'] = posts[i].user.profile_img.url
            serializer_data[i]['destination_city'] = posts[i].plan_id.destination_city.name
            serializer_data[i]['number_of_likes'] = models.Like.objects.filter(post=posts[i].id).count()
            serializer_data[i]['number_of_comments'] = models.Comment.objects.filter(post=posts[i].id).count()
            serializer_data[i]['is_liked'] = models.Like.objects.filter(post=posts[i].id, user=source_user.id).exists()

            images = models.Image.objects.filter(post=posts[i].id)
            serializer_data[i]['images'] = [image.image.url for image in images]

            if source_user == target_user:
                serializer_data[i]['following_state'] = FollowingState.Own.name
            elif models.UserFollowing.objects.filter(user_id=source_user.id, following_user_id=target_user).exists():
                serializer_data[i]['following_state'] = FollowingState.Following.name
            else:
                serializer_data[i]['following_state'] = FollowingState.Follow.name

        return Response(serializer_data, status.HTTP_200_OK)


class TopPlannerView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TopPlannerSerializer

    def get_queryset(self):
        user_auth = self.request.user.id
        followers = models.UserFollowing.objects.filter(user_id=user_auth)
        follow_requests = models.FollowRequest.objects.filter(request_from=user_auth)
        follow_requests_list = list(follow_requests)
        follow_requests_id = []
        followers_list = list(followers)
        following_id = []
        for item in followers_list:
            following_id.append(item.following_user_id.id)
        for item in follow_requests_list:
            follow_requests_id.append(item.request_to.id)
        users = models.BegardUser.objects.exclude(Q(pk__in=following_id) | Q(pk=user_auth) |
                                                  Q(pk__in=follow_requests_id))
        users_list = list(users)
        for person in users_list:
            posts = models.Post.objects.filter(Q(user_id__in=users) & Q(user_id=person.id))
            number_of_likes = 0
            for item in posts:
                number_of_likes += models.Like.objects.filter(post_id=item.id).count()
            person.average_rate = number_of_likes
        sorted_list = sorted(users_list, key=lambda x: x.average_rate)[0:20]
        sorted_list.reverse()
        for person in users_list:
            if sorted_list[0].average_rate != 0:
                person.average_rate = (person.average_rate / sorted_list[0].average_rate) * 9.9
            else:
                person.average_rate = 0
        return sorted_list


class UserPlansView(generics.ListAPIView):
    serializer_class = UserPlansSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user_pk = self.kwargs.get('id')
        self_user = self.request.user.id
        followings = models.UserFollowing.objects.filter(user_id=self_user)
        followings_list = list(followings)
        following_id = []
        for item in followings_list:
            following_id.append(item.following_user_id.id)
        plans = models.Plan.objects.filter(Q(user_id__in=following_id) & Q(user_id=user_pk) |
                                           Q(user__is_public=True) & Q(user_id=user_pk))
        data = serializers.UserPlansSerializer(instance=plans, many=True).data
        return Response(data=data, status=status.HTTP_200_OK)


class LocationsOfPlanView(generics.ListAPIView):
    """List of locations of a plan according to 'id'"""
    permission_classes = [IsAuthenticated, IsPlanOwner]
    serializer_class = serializers.LocationOfPlanSerializer

    def get_queryset(self):
        return models.PlanItem.objects.filter(plan=self.kwargs.get('id'))


class UserSearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomUserDetailsSerializer

    def get_queryset(self):
        query = self.request.query_params.get('query', None)
        result = models.BegardUser.objects.filter(email__icontains=query)
        return result


class UserFollowingView(generics.ListAPIView):
    permission_classes = [AllowAny, IsPublicOrFollowing]
    serializer_class = serializers.ListOfFollowingsSerializer

    def get_queryset(self):
        user = self.kwargs.get('id')
        return models.UserFollowing.objects.filter(Q(user_id=user))


class UserFollowerView(generics.ListAPIView):
    permission_classes = [AllowAny, IsPublicOrFollowing]
    serializer_class = serializers.ListOfFollowersSerializer

    def get_queryset(self):
        user = self.kwargs.get('id')
        return models.UserFollowing.objects.filter(Q(following_user_id=user))
