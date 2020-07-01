from rest_framework import serializers
from .models import Home


class HomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Home
        fields = ['zpid', 'link', 'taxassess', 'lastsoldprice', 'zestimate', 'street',
                  'city', 'state', 'zipcode', 'lastsolddate', 'yearbuild', 'area',
                  'bathrooms', 'bedrooms', 'totalrooms']


class AvgHomesSerializer(serializers.ModelSerializer):
    avgsoldprice = serializers.FloatField()

    class Meta:
        model = Home
        fields = ['city', 'avgsoldprice']
