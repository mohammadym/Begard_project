from django.shortcuts import get_object_or_404
from rest_framework import permissions
from . import models


class DeleteFollowRequestPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.request_from == request.user


class AnswerFollowRequestPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.request_to == request.user


class GetUpdateDeletePlanPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        plan = models.Plan.objects.get(pk=view.kwargs['id'])
        if request.method == "GET":
            if plan.user.is_public:
                return True
            if models.UserFollowing.objects.filter(user_id=request.user.id, following_user_id=plan.user).exists():
                return True

        return plan.user == request.user


class LikeAndCommentOnPostPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        post_id = view.kwargs.get('id')
        user = request.user
        post = get_object_or_404(models.Post, id=post_id)

        if post.user.is_public:
            return True

        if models.UserFollowing.objects.filter(user_id=user, following_user_id=post.user).exists():
            return True

        return False


class AllowGetUserPosts(permissions.BasePermission):

    def has_permission(self, request, view):
        target_user = get_object_or_404(models.BegardUser, id=view.kwargs.get('id'))
        source_user = request.user
        if source_user == target_user:
            return True

        if not target_user.is_public:
            if not models.UserFollowing.objects.filter(user_id=source_user.id,
                                                       following_user_id=target_user.id).exists():
                return False

        return True


class IsPlanOwner(permissions.BasePermission):
    """check that user is owner of plan"""

    def has_permission(self, request, view):
        plan = get_object_or_404(models.Plan, id=view.kwargs.get('id'))
        return request.user == plan.user


class IsPublicOrFollowing(permissions.BasePermission):
    """Check that target user is public or one of followings of user that requested"""

    def has_permission(self, request, view):
        target_user = get_object_or_404(models.BegardUser, id=view.kwargs.get('id'))
        source_user = request.user
        if target_user.is_public:
            return True
        if source_user == target_user:
            return True

        return models.UserFollowing.objects.filter(user_id=source_user.id, following_user_id=target_user.id).exists()
