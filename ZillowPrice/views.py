from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .resources import HomeResource
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework import viewsets
from .models import Home
from .serializer import HomeSerializer, AvgHomesSerializer
from django.db.models import Avg


from tablib import Dataset


def export(request):
    home_resource = HomeResource()
    dataset = home_resource.export()
    response = HttpResponse(dataset.csv, content_type="text/csv")
    response['Content-Disposition'] = 'attachment; filename="homeprice.csv"'
    return response


# Create your views here.

def simple_upload(request):
    if request.method == 'POST':
        home_resource = HomeResource()
        dataset = Dataset()
        new_home = request.FILES['myfile']

        imported_data = dataset.load(new_home.read())
        result = home_resource.import_data(dataset, dry_run=True)
        if not result.has_errors():
            home_resource.import_data(dataset, dry_run=False)
    return render(request, 'core/simple_upload.html')


def map_display(request):
    return render(request, 'index.html')


class HomeViewSet(viewsets.ModelViewSet):
    queryset = Home.objects.all().order_by("lastsolddate")
    serializer_class = HomeSerializer

    def get_queryset(self):
        city = self.request.query_params.get('city', None)
        if city is not None:
            self.queryset = self.queryset.filter(city=city)
        return self.queryset


class AverageHomeViewSet(viewsets.ModelViewSet):
    queryset = Home.objects.values('city').annotate(avgsoldprice=Avg('lastsoldprice')).order_by('city')
    serializer_class = AvgHomesSerializer