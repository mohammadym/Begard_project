import enum
import datetime
from random import shuffle
from ..models import *


class PlanningConstants:
    museum_and_tourist_attraction_start_time_limit = 16
    rest_time_interval_per_day = [(0, 8), (23, 24)]
    default_breakfast_time = 8
    default_lunch_time = 14
    default_dinner_time = 22
    top_place_count = 20


class Tags(enum.Enum):
    unavailable = 1
    breakfast = 2
    lunch = 3
    dinner = 4
    rest = 5
    museum = 6
    recreational_place = 7
    tourist_attraction = 8
    shopping_mall = 9


class Slot:
    def __init__(self, start, finish):
        self.start_date = start
        self.finish_date = finish
        self.place_id = None
        self.place_name = None
        self.place_location = None
        self.tags = []
        self.is_lock_for_tagging = False


class TimeTable:
    def __init__(self, start, finish):
        self.table = []
        self.start_date_time = start
        self.finish_date_time = finish

    def create_table(self, activity_minute, rest_minute):
        total_days = (self.finish_date_time - self.start_date_time).days + 1
        slot_count_per_day = (int)(1440 / (activity_minute + rest_minute))

        activity_timedelta = datetime.timedelta(minutes=activity_minute)
        rest_timedelta = datetime.timedelta(minutes=rest_minute)

        for day in range(total_days):
            self.table.append([])
            flag = datetime.datetime(self.start_date_time.year, self.start_date_time.month, self.start_date_time.day, 0, 0, 0) \
                + datetime.timedelta(days=day)
            for s in range(slot_count_per_day):
                self.table[day].append(Slot(flag, flag + activity_timedelta))
                flag = flag + activity_timedelta + rest_timedelta

    def set_places(self, dest_city):
        days_count = len(self.table)
        places = self.top_from_all_models(dest_city, days_count * 3)

        chosen_so_far = {
            Tags.museum: 0,
            Tags.recreational_place: 0,
            Tags.tourist_attraction: 0,
            Tags.shopping_mall: 0
        }

        for slot in range(len(self.table[0])):
            for day in range(len(self.table)):
                s_slot = self.table[day][slot]

                tag_chosen = self.get_least_used(s_slot.tags, chosen_so_far)

                tag = tag_chosen[0]
                chosen_so_far = tag_chosen[1]

                if chosen_so_far.keys().__contains__(tag):
                    chosen_so_far[tag] += 1

                places = self.select_location[tag](self=self, slot=s_slot, places=places)

    @staticmethod
    def top_from_all_models(city_id, n=PlanningConstants.top_place_count):
        """get top n places from every model in database according to rating"""
        result = {
            "restaurant": list(Restaurant.objects.filter(city=city_id).order_by('-rating')[0:n]
                               if Restaurant.objects.count() > n else Restaurant.objects.all()),

            "museum": list(Museum.objects.filter(city=city_id).order_by('-rating')[0:n]
                           if Museum.objects.count() > n else Museum.objects.all()),

            "tourist_attraction": list(TouristAttraction.objects.filter(city=city_id).order_by('-rating')[0:n]
                                       if TouristAttraction.objects.count() > n else TouristAttraction.objects.all()),

            "recreational_place": list(RecreationalPlace.objects.filter(city=city_id).order_by('-rating')[0:n]
                                       if RecreationalPlace.objects.count() > n else RecreationalPlace.objects.all()),

            "cafe": list(Cafe.objects.filter(city=city_id).order_by('-rating')[0:n]
                         if Cafe.objects.count() > n else Cafe.objects.all()),

            "shopping_mall": list(ShoppingMall.objects.filter(city=city_id).order_by('-rating')[0:n]
                                  if ShoppingMall.objects.count() > n else ShoppingMall.objects.all())
        }

        for value in result.values():
            shuffle(value)

        return result

    def choose(self, slot, places, type_of_place):
        if len(places[type_of_place]) == 0:
            slot.tags = [Tags.rest]
            return places

        selected_place = places[type_of_place][0]
        slot.place_id = selected_place.place_id
        slot.place_name = selected_place.name
        slot.place_location = (selected_place.lat, selected_place.lng)
        places[type_of_place].remove(selected_place)
        return places

    def unavailable_choose_location(self, slot, places):
        slot.place_id = "unavailable"
        slot.place_name = "out of trip"
        return places

    def breakfast_choose_location(self, slot, places):
        return self.choose(slot, places, 'cafe')

    def lunch_dinner_choose_location(self, slot, places):
        return self.choose(slot, places, 'restaurant')

    def rest_choose_location(self, slot, places):
        slot.place_id = "rest"
        slot.place_name = "Resting time"
        return places

    def museum_choose_location(self, slot, places):
        return self.choose(slot, places, 'museum')

    def recreational_choose_location(self, slot, places):
        return self.choose(slot, places, 'recreational_place')

    def tourist_attraction_choose_location(self, slot, places):
        return self.choose(slot, places, 'tourist_attraction')

    def shopping_mall_choose_location(self, slot, places):
        return self.choose(slot, places, 'shopping_mall')

    select_location = {
        Tags.unavailable: unavailable_choose_location,
        Tags.breakfast: breakfast_choose_location,
        Tags.lunch: lunch_dinner_choose_location,
        Tags.dinner: lunch_dinner_choose_location,
        Tags.rest: rest_choose_location,
        Tags.museum: museum_choose_location,
        Tags.recreational_place: recreational_choose_location,
        Tags.tourist_attraction: tourist_attraction_choose_location,
        Tags.shopping_mall: shopping_mall_choose_location
    }

    def tagging(self):
        self.unavailable_tags(self.table)
        self.rest_tags(self.table)
        self.breakfast_lunch_dinner_tags(self.table,
                                         PlanningConstants.default_breakfast_time,
                                         PlanningConstants.default_lunch_time,
                                         PlanningConstants.default_dinner_time)
        self.museum_touristattraction_tags(self.table)
        self.recreationalplace_shoppingmall_tags(self.table)

    def unavailable_tags(self, table):
        hour_start_trip = self.start_date_time.hour
        hour_finish_trip = self.finish_date_time.hour

        for slot in table[0]:
            if slot.start_date.hour < hour_start_trip:
                slot.tags.append(Tags.unavailable)
                slot.is_lock_for_tagging = True

        last = len(table) - 1
        for slot in table[last]:
            if slot.finish_date.hour > hour_finish_trip:
                slot.tags.append(Tags.unavailable)
                slot.is_lock_for_tagging = True

    def rest_tags(self, table, intervals_per_day=None):
        if intervals_per_day is None:
            intervals_per_day = PlanningConstants.rest_time_interval_per_day

        for day in table:
            for slot in day:
                if not slot.is_lock_for_tagging:
                    for i in intervals_per_day:
                        if i[0] <= slot.start_date.hour <= (i[1] - 1):
                            slot.tags.append(Tags.rest)
                            slot.is_lock_for_tagging = True

    def breakfast_lunch_dinner_tags(self, table, breakfast, lunch, dinner):
        for day in table:
            for slot in day:
                if not slot.is_lock_for_tagging:
                    if slot.start_date.hour <= breakfast <= slot.finish_date.hour:
                        slot.tags.append(Tags.breakfast)
                        slot.is_lock_for_tagging = True
                    elif slot.start_date.hour <= lunch <= slot.finish_date.hour:
                        slot.tags.append(Tags.lunch)
                        slot.is_lock_for_tagging = True
                    elif slot.start_date.hour <= dinner <= slot.finish_date.hour:
                        slot.tags.append(Tags.dinner)
                        slot.is_lock_for_tagging = True

    def museum_touristattraction_tags(self, table):
        for day in table:
            for slot in day:
                if not slot.is_lock_for_tagging:
                    if slot.start_date.hour <= PlanningConstants.museum_and_tourist_attraction_start_time_limit:
                        slot.tags.append(Tags.museum)
                        slot.tags.append(Tags.tourist_attraction)

    def recreationalplace_shoppingmall_tags(self, table):
        for day in table:
            for slot in day:
                if not slot.is_lock_for_tagging:
                    slot.tags.append(Tags.recreational_place)
                    slot.tags.append(Tags.shopping_mall)

    def get_least_used(self, tags, chosen_so_far):
        if len(tags) == 1:
            return tags[0], chosen_so_far

        tag = sorted(chosen_so_far.items(), key=lambda items: items[1])[0]

        return tag[0], chosen_so_far

    def get_json_table(self):
        table = self.table
        json = {
            'plan': {
                'start_date': self.start_date_time,
                'finish_date': self.finish_date_time,
                'plan_items': []
            }
        }

        for day in table:
            for s_slot in day:
                if not (s_slot.tags.__contains__(Tags.unavailable) or s_slot.tags.__contains__(Tags.rest)):
                    json_slot = {
                        'start_date': s_slot.start_date,
                        'finish_date': s_slot.finish_date,
                        'place_info': {
                            'id': s_slot.place_id,
                            'lat': s_slot.place_location[0],
                            'lng': s_slot.place_location[1]
                        },
                        'place_name': s_slot.place_name
                    }

                    json['plan']['plan_items'].append(json_slot)

        return json
