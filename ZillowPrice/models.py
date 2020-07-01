from django.db import models

# Create your models here.
from django.db import models

import datetime

YEAR_CHOICES = [(r, r) for r in range(1500, datetime.date.today().year + 1)]


# Create your models here.
class Home(models.Model):
    zpid = models.CharField(max_length=20)
    link = models.CharField(max_length=100)
    taxassess = models.FloatField(null=True)
    lastsoldprice = models.FloatField(null=True)
    zestimate = models.FloatField(null=True)
    street = models.CharField(max_length=100)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=10)
    zipcode = models.CharField(max_length=10)
    lastsolddate = models.DateField()
    yearbuild = models.FloatField(null=True)
    area = models.FloatField(null=True)
    bathrooms = models.FloatField(null=True)
    bedrooms = models.FloatField(null=True)
    totalrooms = models.FloatField(null=True)

    def __str__(self):
        return self.zpid


class HomeSummary(Home):
    class Meta:
        proxy = True
        verbose_name = 'Home Summary'
        verbose_name_plural = 'Homes Summary'
